import { JoinElement } from "../elements/JoinElement";
import { loggedOnPlayerState, logOnAsync } from "../states/LoggedOnPlayerState";
import { logOnPopupState, openLogOnPopup } from "../states/LogOnPopupState";
import { reRunOnStateChange } from "../states/MobX";
import { GenderHelper } from "../types/Gender";
import { UserName } from "../types/UserName";
import { subscribeToEvent } from "../utils";
import { logController } from "./Controller";

export const joinController = logController(function joinController(joinElement: JoinElement) {

	function updateButtonText() {
		const loggedOnPlayerLoadState = loggedOnPlayerState ? loggedOnPlayerState.state : LoadState.NotLoaded;

		if (loggedOnPlayerLoadState === LoadState.Loading) {
			joinElement.buttonText = "Connecting...";
		} else if (loggedOnPlayerLoadState === LoadState.Loaded && (loggedOnPlayerState.value)) {
			joinElement.buttonText = "Connected";
		} else {
			joinElement.buttonText = "Ik wil mee spelen!";
			joinElement.focus();
		}
	}

	function updateJoinButton() {
		joinElement.hide = !!loggedOnPlayerState.value || logOnPopupState.isOpen;
		updateButtonText();
	}

	const unsubscribeAutorun = reRunOnStateChange(updateJoinButton);

	// Handle View events
	//--------------------
	const unsubscribeJoinClick = subscribeToEvent(joinElement, "join-el-click", () => {
		openLogOnPopup(logOnPopupState);
	});

	// Auto Login?
	const userName = localStorage.getItem("userName");
	const gender = localStorage.getItem("gender");
	if (UserName.isValid(userName) && GenderHelper.isValid(gender)) {
		try {
			joinElement.hide = true;
			logOnAsync({
				name: UserName.ensure(userName),
				gender: GenderHelper.ensure(gender)
			});
		} catch (e) {
			joinElement.hide = false;
		}
	} else {
		joinElement.hide = false;
	}

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeJoinClick();
		}
	};
});
