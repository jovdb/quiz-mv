import { Unsubscribe } from "firebase";
import { setMyBet } from "../actions/BetActions";
import { goNext, goRoute } from "../actions/RouteActions";
import { database } from "../database/Database";
import { log } from "../logger";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { playersState } from "../states/PlayersState";
import { routeState } from "../states/RouteState";
import { Gender } from "../types/Gender";
import { UserId } from "../types/UserId";
import { UserName } from "../types/UserName";
import { exhaustiveFail, getRandom } from "../utils";
import { logController } from "./Controller";

export const aiController = logController(function aiController() {

	let unsubscribes: Unsubscribe[] = [];

	// When loggedon player is 'demo' start adding AI players
	function checkAi() {
		const loggedOnPlayer = loggedOnPlayerState.value;
		const createAi = loggedOnPlayer && loggedOnPlayer.name === "demo";
		if (createAi) {
			if (unsubscribes.length === 0) { // Create once
				database.dropAsync();
				unsubscribes.push(createAiPlayers(18));
				unsubscribes.push(createAiQuizmaster());
			}
		} else {
			log("Log off demo players");
			unsubscribes.forEach(u => {
				u();
			});
			unsubscribes = [];
		}
	}

	unsubscribes.push(reRunOnStateChange(checkAi));

	return {
		dispose() {
			unsubscribes.forEach(u => u());
			unsubscribes = [];
		}
	};
});

export function createAiQuizmaster() {

	log("Using AI Quizmaster...");

	function onPlayersRoute() {

		function waitUntilEnoughPlayers() {
			// When transitioned to other page, dont doit
			const currentPage = routeState.value && routeState.value.page || "players";
			if (currentPage === "players") {
				if (playersState.value && playersState.value.filter(p => p.isOnline()).length >= 14) {
					goNext();
				}
			}
		}

		const unsubscribeAutoRun = reRunOnStateChange(waitUntilEnoughPlayers);

		// If no new Player messages check after 4s if already OK
		const timer = setTimeout(waitUntilEnoughPlayers, 4000);

		return () => {
			if (timer) clearTimeout(timer);
			unsubscribeAutoRun();
		};
	}

	function onIntroRoute() {

		function doit() {
			// When transitioned to other page, dont doit
			if (routeState.value && routeState.value.page === "intro") {
				goNext();
			}
		}

		const timer = setTimeout(doit, 4000);
		return () => {
			if (timer) clearTimeout(timer);
		};
	}

	function onBet() {

		function doit() {
			// When transitioned to other page, dont doit
			if (routeState.value && routeState.value.page === "bet") {
				goNext();
			}
		}

		const timer = setTimeout(doit, 3000);
		return () => {
			if (timer) clearTimeout(timer);
		};
	}

	function onBetWait(questionNumber: number) {

		let nbrOfPlayersBet = 0;

		function continueWhenEnoughPlayers() {
			const nbrOfLoggedOnPlayers = playersState.value ? playersState.value.filter(p => p.isOnline()).length : 0;

			// Continue when 95% of the players have bet
			if (nbrOfLoggedOnPlayers > 0 && nbrOfPlayersBet >= nbrOfLoggedOnPlayers * 0.95) {
				goNext();
			}
		}

		const unsubscribeBets = database.watchPlayerBets(questionNumber, bets => {
			nbrOfPlayersBet = Object.keys(bets).length;
			continueWhenEnoughPlayers();
		}).dispose;
		const unsubscribeAutorun = reRunOnStateChange(continueWhenEnoughPlayers);

		return () => {
			unsubscribeBets();
			unsubscribeAutorun();
		};

	}

	function onBetOverview() {

		function doit() {
			// When transitioned to other page, dont doit
			if (routeState.value && routeState.value.page === "bet-overview") {
				goNext();
			}
		}

		const timer = setTimeout(doit, 3000);
		return () => {
			if (timer) clearTimeout(timer);
		};
	}


	function onOverviewRoute() {

		function doit() {
			// When transitioned to other page, dont doit
			if (routeState.value && routeState.value.page === "overview") {
				goNext();
			}
		}

		const timer = setTimeout(doit, 4000);

		return () => {
			if (timer) clearTimeout(timer);
		};
	}


	function aiControllerRouteActions () {

		let routeUnsubscribe: Unsubscribe | undefined;
		const prevRouteUnsubscribe = routeUnsubscribe; // Capture to unsubscribe after new route subscribe
		const currentPage = routeState.value
			? routeState.value.page
			: undefined;
		const currentQuestionNumber = routeState.value
			? routeState.value.questionNumber || 0
			: 0;

		switch (currentPage) {
			case undefined:
			case "players": {
				routeUnsubscribe = onPlayersRoute();
				break;
			}
			case "intro": {
				routeUnsubscribe = onIntroRoute();
				break;
			}
			case "overview": {
				routeUnsubscribe = onOverviewRoute();
				break;
			}
			case "bet": {
				routeUnsubscribe = onBet();
				break;
			}
			case "bet-wait": {
				routeUnsubscribe = onBetWait(currentQuestionNumber);
				break;
			}
			case "bet-overview": {
				routeUnsubscribe = onBetOverview();
				break;
			}
			case "question": {
				break;
			}
			default:
				exhaustiveFail(currentPage);
				break;
		}

		if (prevRouteUnsubscribe) prevRouteUnsubscribe();
	}

	const autoRunUnsubscribe = reRunOnStateChange(aiControllerRouteActions);


	// Start at Players
	goRoute("players");

	return () => {
		autoRunUnsubscribe();
	};
}

export function createAiPlayer(player: Readonly<Pick<IPlayer, "name" | "gender">>) {

	log(`Using AI Player ${player.name}...`);

	let routeUnsubscribe: Unsubscribe | undefined;

	function onBet(questionNumber: number) {

		function doit() {

			const betAmounts = [0.05, 0.1, 0.15];
			const randomBetAmount = betAmounts[Math.floor(Math.random() * betAmounts.length)];

			if (playersState.value) { // Are there players

				const randomPlayerId = getRandom(playersState.value
					.filter(p => p.gender === player.gender) // Only my gender
					.map(p => p.id));
				if (randomPlayerId && routeState.value && (routeState.value.page === "bet" || routeState.value.page === "bet-wait")) {
					setMyBet(UserId.ensure(player.name), questionNumber, player.gender, randomPlayerId, randomBetAmount);
				}
			}
		}

		const delayInMs = Math.round(Math.random() * 10000 + 2000);
		const timer = setTimeout(doit, delayInMs);


		return () => {
			if (timer) clearTimeout(timer);
		};
	}

	// Set View Properties
	function aiControllerForPlayer() {
		const prevRouteUnsubscribe = routeUnsubscribe; // Capture to unsubscribe after, new route subscribe
		const currentPage = routeState.value
			? routeState.value.page
			: undefined;
		const currentQuestionNumber = routeState.value
			? routeState.value.questionNumber || 0
			: 0;

		switch (currentPage) {
			case "players": {
				break;
			}
			case "intro": {
				break;
			}
			case "overview": {
				break;
			}
			case "bet": {
				routeUnsubscribe = onBet(currentQuestionNumber);
				break;
			}
			case "bet-wait": {
				routeUnsubscribe = onBet(currentQuestionNumber);
				break;
			}
			case "bet-overview": {
				break;
			}
			case "question": {
				break;
			}
			case undefined: {
				break;
			}
			default:
				exhaustiveFail(currentPage);
				break;
		}

		if (prevRouteUnsubscribe) prevRouteUnsubscribe();
	}

	const autoRunUnsubscribe = reRunOnStateChange(aiControllerForPlayer, `aiControllerForPlayer: ${player.name}`);

	// Start with delayed login
	let loggedOnPlayer: IPlayer | undefined;
	let logOnTimeout = window.setTimeout(() => { // https://github.com/Microsoft/TypeScript/issues/842#issuecomment-252445883
		database.logOnAsync(player).then(player => {
			if (logOnTimeout) { // Is disposed during Async call?
				loggedOnPlayer = player;
			} else {
				database.logOffAsync(player.id); // Directly logOff
			}
		});
	}, Math.random() * 13000 + 2000);

	// Unsubscribe
	return () => {
		if (logOnTimeout) {
			clearTimeout(logOnTimeout);
			logOnTimeout = 0;
		}
		if (loggedOnPlayer) database.logOffAsync(loggedOnPlayer.id);
		autoRunUnsubscribe();
	};
}

export function createAiPlayers(count = 18) {

	const players: {name: string; gender: Gender}[] = [
		{name: "Jordy", gender: Gender.Male},
		{name: "Lien", gender: Gender.Female},
		{name: "Kris", gender: Gender.Male},
		{name: "Melissa", gender: Gender.Female},
		{name: "Joris", gender: Gender.Male},
		{name: "Angelique", gender: Gender.Female},
		{name: "Maarten", gender: Gender.Male},
		{name: "Liesbeth", gender: Gender.Female},
		{name: "Jeroen", gender: Gender.Male},
		{name: "Vicky", gender: Gender.Female},
		{name: "Koen C", gender: Gender.Male},
		{name: "Ellen M", gender: Gender.Female},
		{name: "Koen V", gender: Gender.Male},
		{name: "Claudia", gender: Gender.Female},
		{name: "Tim", gender: Gender.Male},
		{name: "Carolien", gender: Gender.Female},
		{name: "Dominiek", gender: Gender.Male},
		{name: "Ellen C", gender: Gender.Female},
	];


	// Build an array of AI player info
	const myPlayers: Readonly<Pick<IPlayer, "name" | "gender">>[] = [];
	for (let i = 0; i < count; i++) {
		let player = players[i];

		// Create Player
		if (!player) {
			player = {
				name: `Player${i}`,
				gender : Math.random() > 0.5 ? Gender.Male : Gender.Female
			};
		}

		myPlayers.push({
			name: UserName.ensure(player.name),
			gender: player.gender,
		});
	}

	// Create AI players
	const disposables = myPlayers.map(createAiPlayer);

	// Return unsubscribe
	return () => {
		disposables.forEach(d => {
			d();
		});
	};
}
