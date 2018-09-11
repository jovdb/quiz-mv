import { LogOffPopupElement } from "../elements/LogOffPopupElement";
import { TopPopupElement } from "../elements/TopPopupElement";
import { canLogOff, loggedOnPlayerState, logOffAsync } from "../states/LoggedOnPlayerState";
import { logOffPopupState, openLogOffPopup } from "../states/LogOffPopupState";
import { reRunOnStateChange } from "../states/MobX";
import { assert, combineUnsubscribes, subscribeToEvent } from "../utils";
import { logController } from "./Controller";

export const logOffPopupController = logController(function logOffPopupController(logOffPopupElement: LogOffPopupElement) {

	// Handle View events
	//--------------------
	const unsubscribeLogOffClick = subscribeToEvent(logOffPopupElement, "log-off-click", async () => {

		if (canLogOff()) {
			const loggedOnPlayer = loggedOnPlayerState.value;
			if (loggedOnPlayer) await logOffAsync(loggedOnPlayer.id);

			// Clear login info for auto-login
			localStorage.removeItem("userName");
			localStorage.removeItem("gender");

		} else {
			// Already logged off, just close
			openLogOffPopup(logOffPopupState, false);
		}

	});

	/** Close when clicked on background */
	const unsubscribeBackgroundClick = subscribeToEvent(logOffPopupElement, "popup-bg-click", async () => {
		openLogOffPopup(logOffPopupState, false);
	});

	function updateLogOffPopup() {
		// toggle
		const popupEl = assert(logOffPopupElement.querySelector<TopPopupElement>("top-popup"));

		popupEl.isOpened = !!logOffPopupState.isOpen;

		if (logOffPopupState.isOpen) {

			const loggedOnPlayer = loggedOnPlayerState.value;
			if (loggedOnPlayer) logOffPopupElement.userName = loggedOnPlayer.name;

			// Focus
			const el = popupEl.querySelector("button");
			if (el && "focus" in el) (el as any).focus();
		}
	}

	function checkToCloseLogOffPopupWhenLoggedOff() {
		const loggedOnPlayer = loggedOnPlayerState.value;
		if (loggedOnPlayer) logOffPopupElement.userName = loggedOnPlayer.name; // Don't clear, else it changes during popup fade-out

		// Close LogOff dialog if already logged off
		if (!loggedOnPlayer) openLogOffPopup(logOffPopupState, false);
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(checkToCloseLogOffPopupWhenLoggedOff),
		reRunOnStateChange(updateLogOffPopup),
	]);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeBackgroundClick();
			unsubscribeLogOffClick();
		}
	};
});
