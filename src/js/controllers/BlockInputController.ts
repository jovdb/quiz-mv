import { BalancedScope } from "../BalancedScope";
import { BlockInputElement } from "../elements/BlockInputElement";
import { box, colors, log } from "../logger";
import { firebaseConnectionState } from "../states/FirebaseConnectionState";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { routeState } from "../states/RouteState";
import { combineUnsubscribes } from "../utils";
import { logController } from "./Controller";

export const blockInputController = logController(function blockInputController(blockInputEl: BlockInputElement) {

	const logBox = box("InputBlocker", "#888888");
	const balancedScope = new BalancedScope({
		onStart: () => {
			blockInputEl.classList.add("active");
			log(logBox, box("ON", colors.green));
			return setTimeout(() => { blockInputEl.classList.add("visible"); }, 1500);
		},
		onEnd: (timer) => {
			clearTimeout(timer);
			log(logBox, box("OFF", colors.red));
			blockInputEl.classList.remove("active");
			blockInputEl.classList.remove("visible");
		}
	});

	// Return an update function and capture a start scope
	function busyWhen(condition: () => boolean) {

		let runningScope: (() => void ) | undefined;

		return () => {
			const isBusy = condition();

			// Start
			if (!runningScope && isBusy) {
				runningScope = balancedScope.start();
			}

			// Stop
			else if (runningScope && !isBusy) {
				runningScope(); // end scope
				runningScope = undefined;
			}
		};
	}

	const isLogOnBusyChecker = busyWhen(() => loggedOnPlayerState.state === LoadState.Loading);
	const isConnectionBusyChecker = busyWhen(() => !firebaseConnectionState.value);
	const isRouteBusyChecker = busyWhen(() => routeState.state === LoadState.Loading);

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(function checkIfLogOnBusy() { isLogOnBusyChecker();}),
		reRunOnStateChange(function checkIfConnectionBusy() { isConnectionBusyChecker();}),
		reRunOnStateChange(function checkIfRouteBusy() { isRouteBusyChecker();}),
	]);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			balancedScope.stop();
		}
	};
});
