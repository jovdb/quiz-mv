import { Unsubscribe } from "firebase";
import { database } from "../database/Database";
import { scoreWatcher } from "../database/FirebaseWatchers";

// UI
import { ScoreElement } from "../elements/ScoreElement";
import { BetOverviewPageElement } from "../pages/BetOverviewPageElement";

// State
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { playersState } from "../states/PlayersState";
import { routeState } from "../states/RouteState";
import { scoreState } from "../states/ScoreState";
import { Gender } from "../types/Gender";
import { combineUnsubscribes } from "../utils";

// Controllers
import { logController } from "./Controller";
import { scoreController } from "./ScoreController";

export const betOverviewPageController = logController(function betOverviewPageController(betOverviewPageElement: BetOverviewPageElement) {

	const unsubscribeScore = scoreWatcher.start();
	const unsubscribeScoreController = scoreController(betOverviewPageElement.querySelector<ScoreElement>("score-el")!).dispose;

	let lastTeamBetId: string = "";
	let unsubscribeTeamBets: Unsubscribe | undefined;

	let lastTeamBets: ITeamBets | undefined;

	function updateOverviewPageElement() {
		//const question = game.questions[questionNumber];
		const loggedOnPlayer = loggedOnPlayerState.value;

		// Don't update when navigating away
		if (routeState.value && routeState.value.page !== "bet-overview") return;

		const score = scoreState.value;

		const myGender = loggedOnPlayer ? loggedOnPlayer.gender : undefined;
		const myTeamScore = !score || !myGender ? undefined : myGender === Gender.Male ? score.male : score.female;
		const myTeamRatio = lastTeamBets && myGender ? lastTeamBets[myGender].amount : undefined;
		const myTeamPlayerId = lastTeamBets  && myGender ? lastTeamBets[myGender].playerId : undefined;
		const myTeamPlayer = playersState.value && myTeamPlayerId ? playersState.value.find(p => p.id ===  myTeamPlayerId) : undefined;

		const otherGender = !myGender ? undefined : myGender === Gender.Male ? Gender.Female : Gender.Male;
		const otherTeamScore = !score || !myGender ? undefined : myGender === Gender.Male ? score.female : score.male;
		const otherTeamRatio = lastTeamBets && otherGender ? lastTeamBets[otherGender].amount : undefined;
		const otherTeamPlayerId = lastTeamBets && otherGender ? lastTeamBets[otherGender].playerId : undefined;
		const otherTeamPlayer = playersState.value && otherTeamPlayerId ? playersState.value.find(p => p.id ===  otherTeamPlayerId) : undefined;

		betOverviewPageElement.myTeamGender = myGender;
		betOverviewPageElement.myTeamPercent = myTeamRatio ? Math.round(myTeamRatio * 100).toString() : "";
		betOverviewPageElement.myTeamLoss = myTeamScore && myTeamRatio ? Math.floor(myTeamScore * myTeamRatio) : 0;
		betOverviewPageElement.myTeamProfit = otherTeamScore && myTeamRatio ? Math.floor(otherTeamScore * myTeamRatio) : 0;
		betOverviewPageElement.myTeamPlayerName = myTeamPlayer ? myTeamPlayer.name : "";

		betOverviewPageElement.otherTeamPercent = lastTeamBets && otherGender ? Math.round(lastTeamBets[otherGender].amount * 100).toString() : "";
		betOverviewPageElement.otherTeamLoss = otherTeamScore && otherTeamRatio ? Math.floor(otherTeamScore * otherTeamRatio) : 0;
		betOverviewPageElement.otherTeamProfit = myTeamScore && otherTeamRatio ? Math.floor(myTeamScore * otherTeamRatio) : 0;
		betOverviewPageElement.otherTeamPlayerName = otherTeamPlayer ? otherTeamPlayer.name : "";
	}


	function watchTeamBets() {

		const questionNumber = routeState.value && routeState.value.questionNumber || 0;
		const currentMyBetId = `${questionNumber}`;

		// Something changed?
		if (lastTeamBetId === currentMyBetId) return;

		// Unsubscribe previous
		if (unsubscribeTeamBets) unsubscribeTeamBets();

		// Start watching
		const myTeamBetUnsubscribe = database.watchTeamBets(questionNumber, teamBets => {
			lastTeamBets = teamBets;
			updateOverviewPageElement();
		}).dispose;
		lastTeamBetId = currentMyBetId;

		// Create nbew unsubscribe
		unsubscribeTeamBets = () => {
			myTeamBetUnsubscribe();
			lastTeamBetId = "";
		};
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(updateOverviewPageElement),
		reRunOnStateChange(watchTeamBets),
	]);

	return {
		dispose: () => {
			unsubscribeScore();
			unsubscribeScoreController();
			unsubscribeAutorun();
			if (unsubscribeTeamBets) unsubscribeTeamBets();
		}
	};
});
