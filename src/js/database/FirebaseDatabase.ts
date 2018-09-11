/// <reference path="firebase.d.ts" />

import { Unsubscribe } from "firebase";
import { getId } from "../id";
import { box, colors, log } from "../logger";
import { Gender, GenderHelper } from "../types/Gender";
import { Player } from "../types/Player";
import { Route } from "../types/Route";
import "../types/Score";
import { UserId } from "../types/UserId";
import { UserName } from "../types/UserName";
import { assert } from "../utils";

const config = {
	apiKey: "AIzaSyCArG_HKB3xWQV8GDwHtZSoptM1tcXMftM",
	authDomain: "mv-quiz.firebaseapp.com",
	databaseURL: "https://mv-quiz.firebaseio.com",
	projectId: "mv-quiz",
	storageBucket: "mv-quiz.appspot.com",
	messagingSenderId: "335795130764"
};

const enum DatabasePaths {
	Players = "/players",
	Route = "/route",
	Bets = "/player-bets",
	TeamBet = "/team-bets",
	Score = "/score",
}

declare global {
	interface IGenderBet {
		playerId: UserId;
		amount: number;

		/** Store gender so we can sum by gender without player info */
		gender: Gender;
	}

	interface IGenderBet {
		playerId: UserId;
		amount: number;
	}

	interface ITeamBets {
		[Gender.Female]: IGenderBet;
		[Gender.Male]: IGenderBet;
	}
}

/** Map types to any (we don't knwo what is stored in the database) */
type AsAny<TObject> = {
	[P in keyof TObject]: any;
};

export let logFireBase = true;

export const fireBaseBox = box("firebase", colors.red);

firebase.initializeApp(config);
if (logFireBase) log(fireBaseBox, config.databaseURL);

const enum PromiseState {
	Pending = "pending",
	Resolved = "resolved",
	Rejected = "rejected",
}

function logFirebaseAsync<TPromise extends Promise<any>>(message: string | ((state: PromiseState) => string), promise: TPromise): TPromise {

	if (!logFireBase) return promise;

	const getMessage = (state: PromiseState) => typeof message === "string" ? message : message(state);

	log(fireBaseBox, box("Pending", colors.grey), getMessage(PromiseState.Pending));
	return promise.then(
		function firebaseSetAsyncResolveLogging(v: any) {
			log(fireBaseBox, box("Resolved", colors.green), getMessage(PromiseState.Resolved));
			return v;
		},
		function firebaseSetAsyncRejectLogging(err: any) {
			log(fireBaseBox, box("Rejected", colors.red), getMessage(PromiseState.Rejected));
			throw err;
		}
	) as TPromise;
}

export async function getValue(path: string) {
	const database = assert(firebase.database, "Firebase database is required");
	return database().ref(path).once("value").then(snapShot => snapShot.val());
}

export function watchConnection(cb: (isConnected: boolean) => void ): IDisposable {
	return watchValue("/.info/connected", val => {
		cb(!!val);
	}, true);
}

function watchValue<T>(path: string, cb: (value: Readonly<T> | undefined) => void, shouldLogValue = false): IDisposable {
	const database = assert(firebase.database, "Firebase database is required");
	const ref = database().ref(path);
	const idBox = box(`#${getId()}`, colors.lightGrey);
	if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("ON", colors.green), path);
	ref.on("value", snapShot => {
		const value = snapShot ? snapShot.val() : undefined;
		if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("VAL", colors.blue), `${path}${shouldLogValue ? `: ${JSON.stringify(value)}` : ""}`);
		cb(value);
	});

	return {
		dispose() {
			if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("OFF", colors.red), path);
			ref.off();
		}
	};
}

export function watchArray<T>(path: string, cb: (value: ReadonlyArray<Readonly<T>> | undefined) => void, shouldLogValue = false): IDisposable {
	const database = assert(firebase.database, "Firebase database is required");
	const ref = database().ref(path);
	const idBox = box(`#${getId()}`, colors.lightGrey);

	if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("ON", colors.green), path);
	ref.on("value", snapShot => {
		const value = snapShot ? snapShot.val() : undefined;
		const arr = value ? Object.keys(value).map((key: any) => value[key]) : [];
		if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("VAL", colors.blue), `${path} ${shouldLogValue ? `: ${JSON.stringify(value)}` : ""}`);
		cb(arr);
	});

	return {
		dispose() {
			if (logFireBase) log(fireBaseBox, box("Watch", colors.orange), idBox, box("OFF", colors.red), path);
			ref.off();
		}
	};
}

interface IDatabasePlayer {
	name?: any;
	gender?: any;
	lastOnline?: any;
}

export class FirebaseDatabase implements IDatabase {

	public watchPlayers(cb: (players: ReadonlyArray<Readonly<IPlayer>>) => void ): IDisposable {
		return watchArray<IDatabasePlayer>(DatabasePaths.Players, dbPlayers => {
			if (dbPlayers) {

				const players = dbPlayers

				.filter(dbPlayer => {

					// Skip invalid user names
					if (!dbPlayer || !dbPlayer.name) return false;
					const errorMessage = UserName.validate(dbPlayer.name);
					if (errorMessage) console.warn(`Fetched invalid Player with name: ${dbPlayer.name}: ${errorMessage}`);
					return !errorMessage;
				})
				.map(dbPlayer => {
					return new Player({
						id: UserId.ensure(dbPlayer.name),
						name: UserName.ensure(dbPlayer.name),
						gender: GenderHelper.ensure(dbPlayer.gender),
						lastOnline: typeof dbPlayer.lastOnline === "number" ? new Date(dbPlayer.lastOnline) : undefined
					});
				});

				cb(players);
			} else {
				cb([]);
			}
		});
	}

	private loggedOnUsers: {[userId: string]: Unsubscribe} = {};

	public async logOnAsync(player: Readonly<Pick<IPlayer, "name" | "gender">>): Promise<IPlayer> {
		const playerId = UserId.ensure(player.name);
		const database = assert(firebase.database, "Firebase database is required");
		const playerRef = database().ref(`${DatabasePaths.Players}/${playerId}`);
		const lastOnlineRef = database().ref(`${DatabasePaths.Players}/${playerId}/lastOnline`);
		return new Promise<IPlayer>((resolve, reject) => {

			if (this.loggedOnUsers[playerId]) this.loggedOnUsers[playerId]();

			//TODO: Use balancd scope so only one time watched for multiple uses (demo)
			const unsubscribeConnection = watchConnection(isOnline => {
				if (isOnline) {

					// On disconnect, store a value
					lastOnlineRef.onDisconnect().set(database.ServerValue.TIMESTAMP);

					// Add to players
					const dbPlayer: IDatabasePlayer = {
						name: player.name,
						gender: player.gender,
					};

					logFirebaseAsync(`Add player to '${playerRef.path}'`, playerRef.set(dbPlayer).then(() => {
						resolve(new Player({
							...player,
							id: playerId,
							lastOnline: undefined
						}));
					}, reject));
				}
			}).dispose;

			this.loggedOnUsers[playerId] = () => {
				unsubscribeConnection();
				lastOnlineRef.onDisconnect().cancel();
			};
		});
	}

	public async logOffAsync(playerId: UserId): Promise<void > {
		if (this.loggedOnUsers[playerId]) this.loggedOnUsers[playerId]();
		const database = assert(firebase.database, "Firebase database is required");
		const lastOnlineRef = database().ref(`${DatabasePaths.Players}/${playerId}/lastOnline`);

		return logFirebaseAsync(
			`Log off user: '${lastOnlineRef.path}'`,
			lastOnlineRef.set(database.ServerValue.TIMESTAMP)
		);
	}

	public async setRouteAsync(route: Route | undefined): Promise<void > {
		const database = assert(firebase.database, "Firebase database is required");
		return logFirebaseAsync(
			`Set '${DatabasePaths.Route}' to '${route}'`,
			database().ref(DatabasePaths.Route).set({
				page: route
			})
		);
	}

	public watchRoute(cb: (route : Route, questionNumber: number) => void ): IDisposable {
		return watchValue<{page?: Route; questionNumber?: number} | undefined>(DatabasePaths.Route, dbRoute => {
			const route = dbRoute ? dbRoute.page : "players";
			const questionNumber = dbRoute ? dbRoute.questionNumber || 0 : 0;
			if (Route.isValid(route)) {
				cb(route, questionNumber);
			} else {
				cb("players", 0);
			}
		}, true);
	}

	public async setMyBetAsync(playerId: UserId, questionNumber: number, myGender: Gender, selectedPlayerId: UserId, selectedBetAmount: number): Promise<void > {
		const database = assert(firebase.database, "Firebase database is required");
		const playerBetRef = database().ref(`${DatabasePaths.Bets}/${questionNumber}/${playerId}`);
		const myBet: IGenderBet = {
			playerId: selectedPlayerId,
			amount: selectedBetAmount,
			gender: myGender
		};
		return logFirebaseAsync(
			`Storing bet of player ${playerId}, question ${questionNumber}`,
			playerBetRef.set(myBet)
		);
	}

	public watchMyBet(playerId: UserId, questionNumber: number, cb: (myBet: IGenderBet | undefined) => void ): IDisposable {
		return watchValue<AsAny<IGenderBet> | undefined>(`${DatabasePaths.Bets}/${questionNumber}/${playerId}`, dbMyBet => {
			const playerId = dbMyBet ? dbMyBet.playerId || undefined : undefined;
			const amount = dbMyBet ? dbMyBet.amount || undefined : undefined;
			const gender = dbMyBet ? dbMyBet.gender || undefined : undefined;
			if (UserId.isValid(playerId) && typeof amount === "number") {
				cb({playerId, amount, gender});
			} else {
				cb(undefined);
			}
		});
	}

	public watchPlayerBets(questionNumber: number, cb: (bets: {[userId: string]: IGenderBet}) => void ): IDisposable {
		return watchValue<AsAny<{[userId: string]: IGenderBet}> | undefined>(`${DatabasePaths.Bets}/${questionNumber}`, bets => {
			cb(bets || {});
		});
	}

	public async setTeamBetAsync(questionNumber: number, teamBets: ITeamBets): Promise<void > {
		const database = assert(firebase.database, "Firebase database is required");
		const playerBetRef = database().ref(`${DatabasePaths.TeamBet}/${questionNumber}`);
		return playerBetRef.set(teamBets);
	}

	public watchTeamBets(questionNumber: number, cb: (betTotal: ITeamBets | undefined) => void ): IDisposable {
		return watchValue<AsAny<ITeamBets> | undefined>(`${DatabasePaths.TeamBet}/${questionNumber}`, teamBets => {
			// TODO: validate
			cb(teamBets);
		});
	}

	public watchScore(cb: (score: IScore) => void ): IDisposable {
		return watchValue<any>(`${DatabasePaths.Score}`, (score: Partial<IScore> | undefined) => {
			if (!score) score = {};
			score.female = score.female === undefined ? 1000 : score.female || 0;
			score.male = score.male === undefined ? 1000 : score.male || 0;
			cb(score as IScore);
		});
	}

	public dropAsync() {
		const database = assert(firebase.database, "Firebase database is required");
		return database().ref("/").remove();

		/*
		const playersRef = database().ref(`${DatabasePaths.Players}`);
		const playerBetRef = database().ref(`${DatabasePaths.Bets}`);
		const scoreRef = database().ref(`${DatabasePaths.Score}`);
		const teamBetRef = database().ref(`${DatabasePaths.TeamBet}`);
		const routeRef = database().ref(`${DatabasePaths.Route}`);

		Promise.all[
			playersRef.remove(),
			playerBetRef.remove(),
			scoreRef.remove(),
			teamBetRef.remove(),
			routeRef.remove(),
		]);*/
	}
}
