import { Unsubscribe } from "firebase";
import { genderBackgroundController } from "../controllers/GenderBackgroundController";
import { scoreController } from "../controllers/ScoreController";
import { database } from "../database/Database";
import { GenderBackgroundElement } from "../elements/GenderBackgroundElement";
import { ScoreElement } from "../elements/ScoreElement";
import { BetWaitPageElement } from "../pages/BetWaitPageElement";
import { reRunOnStateChange } from "../states/MobX";
import { playersState } from "../states/PlayersState";
import { routeState } from "../states/RouteState";
import { UserId } from "../types/UserId";
import { combineUnsubscribes } from "../utils";
import { logController } from "./Controller";

export const betWaitPageController = logController(function betWaitPageController(betWaitPageElement: BetWaitPageElement) {

	const getQuestionNumber = () => routeState.value ? routeState.value.questionNumber || 0 : undefined;
	let questionNumber = getQuestionNumber();
	let playerIds: ReadonlyArray<UserId> = [];

	const unsubscribeBackground = genderBackgroundController(betWaitPageElement.querySelector("gender-bg-el") as GenderBackgroundElement).dispose;
	const unsubscribeScore = scoreController(betWaitPageElement.querySelector("score-el") as ScoreElement).dispose;
	const questionBets = subscribeWhenChanged({
		subscribe: () => {
			return typeof questionNumber === "number"

				? database.watchPlayerBets(questionNumber, bets => {
					playerIds = Object.keys(bets || {}).filter(UserId.isValid) as UserId[];
					updatePlayers();
				}).dispose
				: () => undefined;
		},
		getChangeId: () => `${getQuestionNumber()}`
	});

	function betWaitPageRouteWatcher() {
		questionNumber = getQuestionNumber();
		questionBets.validate();
	}

	// Update Players
	const unsubscribeAutoRun = combineUnsubscribes([
		reRunOnStateChange(betWaitPageRouteWatcher),
		reRunOnStateChange(updatePlayers),
	]);

	questionBets.validate();

	function updatePlayers() {
		betWaitPageElement.players = playersState.value ? playersState.value.filter(p => p.isOnline()) : undefined;
		betWaitPageElement.playerIds = playerIds;
	}

	function subscribeWhenChanged(options: {
		subscribe(): Unsubscribe;
		getChangeId(): string;
	}) {

		const { subscribe, getChangeId } = options;
		let lastId: string | undefined;
		let unsubscribe: Unsubscribe | undefined;

		const result = {
			//Something changed, check if new subscription needed
			validate: () => {
				const id = getChangeId();
				if (id === lastId) return; // same data, skip
				lastId = id;
				result.subscribe();
			},
			subscribe: () => {
				result.unsubscribe();
				unsubscribe = subscribe();
			},
			unsubscribe: () => {
				if (unsubscribe) unsubscribe();
			},
		};

		return result;
	}

	return {
		dispose: () => {
			unsubscribeBackground();
			unsubscribeScore();
			unsubscribeAutoRun();
			questionBets.unsubscribe();
		}
	};
});
