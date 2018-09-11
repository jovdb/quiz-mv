import { QuestionPageElement } from "../pages/QuestionPageElement";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { routeState } from "../states/RouteState";
import { isQuizmaster } from "../types/Player";
import { logController } from "./Controller";
import { genderBackgroundController } from "./GenderBackgroundController";
import { scoreController } from "./ScoreController";

export const questionPageController = logController(function questionPageController(questionPageElement: QuestionPageElement) {

	const unsubscribeBackground = genderBackgroundController(questionPageElement.querySelector<any>("gender-bg-el")).dispose;
	const unsubscribeScore = scoreController(questionPageElement.querySelector<any>("score-el")).dispose;

	// TODO: watch currentbet
	function updateQuestionPageElement() {

		const questionNumber = routeState.value && routeState.value.questionNumber || 0;
		const question = game.questions[questionNumber];
		const loggedOnPlayer = loggedOnPlayerState.value;

		questionPageElement.questionNumber = questionNumber;
		questionPageElement.questionTitle = question ? question.title : "";
		questionPageElement.questionDescription = question ? question.description : "";
		questionPageElement.questionInfo = question && isQuizmaster(loggedOnPlayer) ? question.info : "";

	}

	const unsubscribeAutorun = reRunOnStateChange(updateQuestionPageElement);

	return {
		dispose: () => {
			unsubscribeAutorun();
			unsubscribeBackground();
			unsubscribeScore();
		}
	};
});

/*
export interface IQuestionPlayersBet {
	readonly [playerId: string]: IGenderBet | undefined;
}

export interface IQuestionsPlayersBet {
	readonly [questionNumber: number]: LoadStateAndValue<IQuestionPlayersBet> | undefined;
}*/