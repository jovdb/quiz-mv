import { FabMenuElement } from "../elements/FabMenuElement";
import { fabMenuState, openFabMenu } from "../states/FabMenuState";
import { canLogOff, canLogOn, loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { openLogOffPopup } from "../states/LogOffPopupState";
import { logOffPopupState } from "../states/LogOffPopupState";
import { logOnPopupState, openLogOnPopup } from "../states/LogOnPopupState";
import { reRunOnStateChange } from "../states/MobX";
import { combineUnsubscribes, subscribeToEvent } from "../utils";
import { logController } from "./Controller";

export const fabMenuController = logController(function fabMenuController(fabMenuElement: FabMenuElement) {

	// Handle View events
	//--------------------
	const unsubscribeFabClick = subscribeToEvent(fabMenuElement, "fab-menu-click", e => {
		const button = e.detail.element;

		// Hidden?
		if (!fabMenuElement.isOpen) return;

		// User button clicked
		if (button.querySelector(".toggleLogOn")) {
			if (canLogOff()) openLogOffPopup(logOffPopupState);
			else if (canLogOn()) openLogOnPopup(logOnPopupState);
			else console.warn("Cannot log on or off");
		} else {
			alert("todo");
		}
	});

	const unsubscribeFabOpenChanged = subscribeToEvent(fabMenuElement, "fab-menu-opened", e => {
		openFabMenu(fabMenuState, !!e.detail.isOpen);
	});


	// Update UI
	function updateFabMenu() {
		fabMenuElement.hide = !(loggedOnPlayerState.value);

		// Close if hidden
		if (fabMenuElement.hide) {
			fabMenuElement.isOpen = false;
		}

		// Close when popup is open
		if (logOffPopupState.isOpen) {
			fabMenuElement.isOpen = false;
		}
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(updateFabMenu)
	]);


	// Unsubscribe
	const result = {
		dispose() {
			unsubscribeAutorun();
			unsubscribeFabOpenChanged();
			unsubscribeFabClick();
		}
	};

	return result;
});
