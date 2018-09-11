import { genderBackgroundController } from "../controllers/GenderBackgroundController";
import { GenderBackgroundElement } from "../elements/GenderBackgroundElement";
import { logController } from "./Controller";

export const introPageController = logController(function introPageController(introPageElement: HTMLElement) {

	const genderEl = introPageElement.querySelector<GenderBackgroundElement>("gender-bg-el")!;
	const unsubscribeBackground = genderBackgroundController(genderEl).dispose;

	return {
		dispose: () => {
			unsubscribeBackground();
		}
	};
});
