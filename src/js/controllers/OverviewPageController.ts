import { genderBackgroundController } from "../controllers/GenderBackgroundController";
import { scoreController } from "../controllers/ScoreController";
import { GenderBackgroundElement } from "../elements/GenderBackgroundElement";
import { ScoreElement } from "../elements/ScoreElement";
import { logController } from "./Controller";

export const overviewPageController = logController(function overviewPageController(overviewPageElement: HTMLElement) {

	const unsubscribeBackground = genderBackgroundController(overviewPageElement.querySelector("gender-bg-el") as GenderBackgroundElement).dispose;
	const unsubscribeScore = scoreController(overviewPageElement.querySelector("score-el") as ScoreElement).dispose;

	return {
		dispose: () => {
			unsubscribeBackground();
			unsubscribeScore();
		}
	};
});
