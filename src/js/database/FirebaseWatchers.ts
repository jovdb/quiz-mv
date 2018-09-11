import { BalancedScope } from "../BalancedScope";
import { database } from "../database/Database";
import { watchConnection } from "../database/FirebaseDatabase";

// State
import { firebaseConnectionState, setFirebaseConnection } from "../states/FirebaseConnectionState";
import { whenStatePropUsed } from "../states/MobX";
//import { changePlayersBet } from "../states/Mutations";
import { playersState, setPlayers } from "../states/PlayersState";
import { routeState, setRoute } from "../states/RouteState";
import { scoreState, setScore } from "../states/ScoreState";

import { isQuizmaster } from "../types/Player";

export const playersWatcher = new BalancedScope({
	onStart: () => {

		setPlayers(playersState, {state: LoadState.Loading});
		return database.watchPlayers(players => {
			const filteredPlayers = players.filter(p => !isQuizmaster(p));
			setPlayers(playersState, {state: LoadState.Loaded, value: filteredPlayers});
		}).dispose;
	},
	onEnd: unsubscribe => {
		unsubscribe();
		setPlayers(playersState, {state: LoadState.NotLoaded});
	}
});

export const scoreWatcher = new BalancedScope({
	onStart: () => {
		setScore(scoreState, {state: LoadState.Loading});
		return database.watchScore(score => {
			setScore(scoreState,{state: LoadState.Loaded, value: score});
		}).dispose;
	},
	onEnd: unsubscribe => {
		unsubscribe();
		setScore(scoreState, {state: LoadState.NotLoaded});
	}
});

export const routeWatcher = new BalancedScope({
	onStart: () => {
		setRoute(routeState, {state: LoadState.Loading});
		return database.watchRoute((route , questionNumber) => {
			setRoute(routeState,{state: LoadState.Loaded, value: {
				page: route,
				questionNumber
			}}); // slice because tests use an observable array
		}).dispose;
	},
	onEnd: unsubscribe => {
		unsubscribe();
		setRoute(routeState, {state: LoadState.NotLoaded});
	}
});

export const isConnectedWatcher = new BalancedScope({
	onStart: () => {
		setFirebaseConnection(firebaseConnectionState, {state: LoadState.Loading});
		return watchConnection(isConnected => {
			setFirebaseConnection(firebaseConnectionState, {state: LoadState.Loaded, value: isConnected});
		}).dispose;
	},
	onEnd: unsubscribe => {
		unsubscribe();
		setFirebaseConnection(firebaseConnectionState, {state: LoadState.NotLoaded});
	}
});


export const playerBetsWatchers: {[questionNumber: number]: IBalancedScope} = {};

/*
export function playerBetsWatcher(questionNumber: number) {

	if (playerBetsWatchers[questionNumber]) return questionNumber[questionNumber];

	// returning a new BalancedScope defeeds the purpose
	// Hold it in a map
	return questionNumber[questionNumber] = new BalancedScope({
		onStart: () => {
			changePlayersBet(questionNumber, {state: LoadState.Loading});
			return database.watchPlayerBets(questionNumber, bets => {
				changePlayersBet(questionNumber, {state: LoadState.Loaded, value: bets});
			}).dispose;
		},
		onEnd: unsubscribe => {
			unsubscribe();
			delete questionNumber[questionNumber];
			changePlayersBet(questionNumber, undefined);
		}
	});
}*/


/*
return typeof questionNumber === "number"
? database.watchPlayerBets(questionNumber, bets => {
	playerIds = Object.keys(bets || {}).filter(UserId.isValid) as UserId[];
	updateEl();
}).dispose
: () => undefined;*/

whenStatePropUsed(playersState, "Get players from firebase...", "value", () => playersWatcher.start());
whenStatePropUsed(routeState, "Watch route changes", "value", () => routeWatcher.start());
whenStatePropUsed(firebaseConnectionState, "Watch firebase connection", "value", () => isConnectedWatcher.start());