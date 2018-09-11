import { scoreWatcher } from "../database/FirebaseWatchers";
import { ScoreElement } from "../elements/ScoreElement";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { scoreState } from "../states/ScoreState";
import { combineUnsubscribes } from "../utils";
import { logController } from "./Controller";

export const scoreController = logController(function scoreController(scoreElement: ScoreElement) {

	function updateScore() {
		const score = scoreState.value;
		scoreElement.maleScore = score ? score.male : 0;
		scoreElement.femaleScore = score ? score.female : 0;
	}

	function updateScoreGender() {
		scoreElement.gender = loggedOnPlayerState.value
			? loggedOnPlayerState.value.gender
			: undefined;
	}

	// TODO: Use Score HOOK
	const unsubscribeScore = scoreWatcher.start();

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(updateScoreGender),
		reRunOnStateChange(updateScore),
	]);

	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeScore();
		}
	};

});
