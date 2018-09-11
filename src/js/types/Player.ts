import { Gender } from "./Gender";

declare global {
	interface IPlayer {
		id: UserId;
		name: UserName;
		gender: Gender;
		/** When users goes offline, this timestamp is added */
		lastOnline?: Date;
		isOnline(allowedOfflineTimeInSeconds?: number): boolean;
	}

	type IReadonlyPlayer = Readonly<IPlayer>;
}

export class Player implements IPlayer {

	public id: UserId;
	public name: UserName;
	public gender: Gender;

	/** Last time online */
	public lastOnline?: Date;

	constructor(data: Pick<IPlayer, "id" | "name" | "gender" | "lastOnline">) {
		this.id = data.id;
		this.name = data.name;
		this.gender = data.gender;
		this.lastOnline = data.lastOnline;
	}

	public isOnline(allowedOfflineTimeInSeconds = 0) {
		return this.lastOnline && allowedOfflineTimeInSeconds
			? (Date.now() - this.lastOnline.valueOf()) > allowedOfflineTimeInSeconds * 1000
			: !this.lastOnline;
	}
}

export function isQuizmaster(player: Readonly<IPlayer> | undefined) {
	return !!player && (player.name === "quizmaster" || player.name === "demo");
}