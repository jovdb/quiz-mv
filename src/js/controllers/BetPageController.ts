import { Unsubscribe } from "firebase";
import { setMyBet } from "../actions/BetActions";
import { GenderBackgroundElement } from "../elements/GenderBackgroundElement";
import { ScoreElement } from "../elements/ScoreElement";
import { BetPageElement } from "../pages/BetPageElement";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { playersState } from "../states/PlayersState";

import { routeState, setRoute } from "../states/RouteState";
import { scoreState } from "../states/ScoreState";
import { Gender } from "../types/Gender";
import { isQuizmaster } from "../types/Player";
import { logController } from "./Controller";
import { genderBackgroundController } from "./GenderBackgroundController";
import { scoreController } from "./ScoreController";
import { vibrate } from "./VibrationControler";

export const betPageController = logController(function betPageController(betPageElement: BetPageElement) {

	const unsubscribeBackground = genderBackgroundController(betPageElement.querySelector<GenderBackgroundElement>("gender-bg-el")!).dispose;
	const unsubscribeScore = scoreController(betPageElement.querySelector<ScoreElement>("score-el")!).dispose;
	let unsubscribeCountDown: Unsubscribe | undefined;

	// TODO: watch currentbet

	function startCountDown(): Unsubscribe {

		betPageElement.secondsRemaining = typeof betPageElement.secondsRemaining !== "number"
			? 10
			: Math.max(betPageElement.secondsRemaining - 1, 0);

		let intervalId = window.setInterval(async () => { // https://github.com/Microsoft/TypeScript/issues/842#issuecomment-252445883

			let secondsRemaining = typeof betPageElement.secondsRemaining !== "number" ? 10 : betPageElement.secondsRemaining;
			betPageElement.secondsRemaining = Math.max(--secondsRemaining, 0);

			// Vibrate
			vibrate(
				secondsRemaining > 3 ? 50 :
				secondsRemaining > 0 ? 100 :
				600
			);

			// Set interval
			if (secondsRemaining <= 0) { // Times up

				const teamPlayers = loggedOnPlayerState.value
					? getTeamPlayers(loggedOnPlayerState.value.gender)
					: [];

				if (
					loggedOnPlayerState &&
					loggedOnPlayerState.value && // still logged on
					routeState &&
					routeState.value &&
					routeState.value.page === "bet" && // still on bet page
					teamPlayers.length > 0 // players needed for storing random player
				) {

					// Store bet
					await setMyBet(
						loggedOnPlayerState.value.id,
						routeState.value.questionNumber,
						loggedOnPlayerState.value.gender,
						betPageElement.selectedPlayerId || randomPlayer(teamPlayers)!.id,
						betPageElement.selectedBet || 0.15,
					);

					// Navigate to next page
					if (routeState.value) {
						const questionNumber = routeState.value.questionNumber;
						setRoute(routeState, {
							state: LoadState.Loaded,
							value: {
								page: "bet-wait",
								questionNumber
							}
						});
					}
				} else {
					// only unsubscribe if bet is stored
					unsubscribe();
				}
			}
		}, 1000);

		const unsubscribe = () => {
			if (intervalId) {
				betPageElement.secondsRemaining = undefined;
				clearInterval(intervalId);
				intervalId = 0;
			}
		};
		return unsubscribe;
	}

	function getTeamPlayers(gender?: Gender) {
		const players = playersState.value ? playersState.value.slice(0) : [];
		players.sort((a, b) => a.name > b.name ? 1 : -1);

		return players && gender
			? players.filter(p =>
				p.gender === gender && // Same gender
				p.isOnline(60) // Don't show when to long offline
			)
			: [];

	}

	function randomPlayer(players: ReadonlyArray<Readonly<IPlayer>>) {
		return players.length > 0
			? players[Math.floor(Math.random() * players.length)]
			: undefined;
	}


	function updateBetPageElement() {
		const page = routeState.value && routeState.value.page || "bet";
		const questionNumber = routeState.value && routeState.value.questionNumber || 0;
		const question = game.questions[questionNumber];
		const loggedOnPlayer = loggedOnPlayerState.value;
		const gender = loggedOnPlayer ? loggedOnPlayer.gender : undefined;
		const teamPlayers = getTeamPlayers(gender);

		// When page changed, don't update UI
		if (page !== "bet") return;

		// Countdown for quizmaster
		// only start counting if players are available
		if (teamPlayers.length === 0 || isQuizmaster(loggedOnPlayer)) {
			if (unsubscribeCountDown) {
				unsubscribeCountDown();
				unsubscribeCountDown = undefined;
			}
		}

		// Countdown
		else {
			if (!unsubscribeCountDown) unsubscribeCountDown = startCountDown();
		}

		const score = scoreState.value;

		betPageElement.players = teamPlayers;
		betPageElement.ourScore = score && gender
			? gender === Gender.Male
				? score.male
				: score.female
			: undefined;

		betPageElement.enemyScore = score && gender
			? gender === Gender.Male
				? score.female
				: score.male
			: undefined;

		betPageElement.questionNumber = questionNumber;
		betPageElement.questionTitle = question.title || undefined;

		// Set defaults
		if (!betPageElement.selectedBet) betPageElement.selectedBet = 0.15;
		if (!betPageElement.selectedPlayerId && teamPlayers && teamPlayers.length > 0) betPageElement.selectedPlayerId = randomPlayer(teamPlayers)!.id;

	}

	const unsubscribeAutorun = reRunOnStateChange(updateBetPageElement);

	return {
		dispose: () => {
			unsubscribeBackground();
			unsubscribeScore();
			unsubscribeAutorun();
			if (unsubscribeCountDown) unsubscribeCountDown();
		}
	};
});
