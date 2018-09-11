import { GenderBackgroundElement } from "../elements/GenderBackgroundElement";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { logController } from "./Controller";

export const genderBackgroundController = logController(function genderBackgroundController(genderBackgroundElement: GenderBackgroundElement) {

	const unsubscribeAutorun = reRunOnStateChange(function updateBackgroundColorOnGenderChange() {
		const player = loggedOnPlayerState.value;
		genderBackgroundElement.gender = player ? player.gender : undefined;
	});

	return {
		dispose() {
			unsubscribeAutorun();
		}
	};
});
