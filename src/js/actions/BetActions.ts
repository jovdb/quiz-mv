import { Unsubscribe } from "firebase";
import { database } from "../database/Database";
import { Gender } from "../types/Gender";
import { groupBy } from "../utils";

export const setMyBet = database.setMyBetAsync;

export const setTeamBetAsync = database.setTeamBetAsync;

export async function updateTeamBetAsync(questionNumber: number) {
	let unsubscribe!: Unsubscribe;
	return new Promise<void >((resolve, reject) => {
		unsubscribe = database.watchPlayerBets(questionNumber, bets => {
				// Get all bets
				const betObjects = Object.keys(bets).map(key => bets[key]);

				const maleBets = betObjects.filter(b => b.gender === Gender.Male);
				const maleTeam: ITeamBets["male"] = {
					gender: Gender.Male,
					amount: maleBets.length > 0 ? Math.round(maleBets.reduce((prev, curr) => prev + curr.amount, 0) * 100 / maleBets.length) / 100 : 0.15,
					playerId: "" as UserId
				};

				let playerIdCount = 0;
				groupBy(maleBets, i => i.playerId).forEach((v, k) => {
					if (playerIdCount < v.length) {
						playerIdCount = v.length;
						maleTeam.playerId = k;
					}
				});

				const femaleBets = betObjects.filter(b => b.gender === Gender.Female);
				const femaleTeam: ITeamBets["female"] = {
					gender: Gender.Female,
					amount: femaleBets.length > 0 ? Math.round(femaleBets.reduce((prev, curr) => prev + curr.amount, 0) * 100 / maleBets.length) / 100 : 0.15,
					playerId: "" as UserId
				};

				playerIdCount = 0;
				groupBy(femaleBets, i => i.playerId).forEach((v, k) => {
					if (playerIdCount < v.length) {
						playerIdCount = v.length;
						femaleTeam.playerId = k;
					}
				});

				const teamBets: ITeamBets = {
					male: maleTeam,
					female: femaleTeam
				};

				setTeamBetAsync(questionNumber, teamBets).then(resolve, reject);
		}).dispose;
	}).then(
		() => {if (unsubscribe) unsubscribe(); },
		() => {if (unsubscribe) unsubscribe(); },
	);

}

