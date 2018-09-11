import { canGoNext, canGoPrev, goNext, goPrev } from "../actions/RouteActions";
import { NavigationElement } from "../elements/NavigationElement";
import { fabMenuState } from "../states/FabMenuState";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";

import { isQuizmaster } from "../types/Player";
import { combineUnsubscribes, subscribeToEvent } from "../utils";
import { logController } from "./Controller";

export const navigationController = logController(function navigationController(navigationElement: NavigationElement) {

	function updateNavigationVisibility() {
		navigationElement.hide = !isQuizmaster(loggedOnPlayerState.value) || (fabMenuState.isOpen);
	}

	function updateNavigationButtonState() {
		navigationElement.disablePrev = !canGoPrev();
		navigationElement.disableNext = !canGoNext();
	}

	const unsubscribeAutoRun = reRunOnStateChange(updateNavigationButtonState);

	const unsubscribeLeftClick = subscribeToEvent(navigationElement, "navigation-el-left-click", e => {
		e.stopPropagation();
		goPrev();
	});

	const unsubscribeRightClick = subscribeToEvent(navigationElement, "navigation-el-right-click", e => {
		e.stopPropagation();
		goNext();
	});

	const unsubscribeKeyPress = subscribeToEvent(window, "keydown", e => {
		const keyCode = e.which;

		// Page Up
		if (keyCode === 33) {
			e.stopPropagation();
			e.preventDefault();
			goPrev();
		}

		// PageUDown
		else if (keyCode === 34) {
			e.stopPropagation();
			e.preventDefault();
			goNext();
		}
	});

	function updateNavigation() {
		updateNavigationVisibility();
		updateNavigationButtonState();
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(updateNavigation),
		reRunOnStateChange(updateNavigationVisibility),
	]);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeLeftClick();
			unsubscribeRightClick();
			unsubscribeAutoRun();
			unsubscribeKeyPress();
		}
	};
});
