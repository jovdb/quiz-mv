import { LogOnPopupElement } from "../elements/LogOnPopupElement";
import { TopPopupElement } from "../elements/TopPopupElement";
import { canLogOn, loggedOnPlayerState, logOnAsync } from "../states/LoggedOnPlayerState";
import { logOnPopupState, openLogOnPopup } from "../states/LogOnPopupState";
import { reRunOnStateChange } from "../states/MobX";
import { assert, combineUnsubscribes, subscribeToEvent } from "../utils";
import { logController } from "./Controller";

export const logOnPopupController = logController(function logOnPopupController(logOnPopupElement: LogOnPopupElement) {

	// Handle View events
	//--------------------
	const unsubscribeLogOnClick = subscribeToEvent(logOnPopupElement, "log-on-click", async () => {

		if (canLogOn()) {

			const userName = logOnPopupElement.userName;
			const gender = logOnPopupElement.gender;
			if (userName && gender) {
				await logOnAsync({
					name: userName,
					gender
				});

				// Remember login info for auto-login
				localStorage.setItem("userName", userName);
				localStorage.setItem("gender", gender);
			}
		} else {
			// Already logged off, just close
			openLogOnPopup(logOnPopupState, false);
		}
	});

	/** Close when clicked on background */
	const unsubscribeBackgroundClick = subscribeToEvent(logOnPopupElement, "popup-bg-click", async () => {
		openLogOnPopup(logOnPopupState, false);
	});

	function updateLogOnPopup() {
		const popupEl = assert(logOnPopupElement.querySelector<TopPopupElement>("top-popup"));
		popupEl.isOpened = !!logOnPopupState.isOpen;
		if (logOnPopupState.isOpen) {

			// Focus
			const el = popupEl.querySelector<HTMLElement>('[name="name"]');
			if (el && "focus" in el) el.focus();
		}
	}

	function checkToCloseLogOnPopupWhenLoggedOn() {
		// Close after user is logged login
		if (loggedOnPlayerState.value) {
			openLogOnPopup(logOnPopupState, false);
		}
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(checkToCloseLogOnPopupWhenLoggedOn),
		reRunOnStateChange(updateLogOnPopup),
	]);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeLogOnClick();
			unsubscribeBackgroundClick();
		}
	};
});