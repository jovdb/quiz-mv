import { reaction } from "mobx";
import { routeState } from "../states/RouteState";
import { logController } from "./Controller";

export function vibrate(pattern: number | number[]) {
	// https://www.chromestatus.com/feature/5644273861001216
	try {
		if (navigator && navigator.vibrate) navigator.vibrate(pattern);
	} catch (e) {
		// Some browsers don't allow vibrate when page not active
	}
}


export const vibrationController = logController(function vibrationController() {

	const unsubscribeReaction = reaction(

		// Only check route when loaded, else when we use route, it will start requesting the route from the database
		() => routeState.state === LoadState.Loaded
			? routeState.value
			: undefined,
		() => {
			vibrate(20);
		},
		{
			name: "Vibrate on route change",
		}
	);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeReaction();
		}
	};
});
