import { FirebaseDatabase } from "./FirebaseDatabase";

declare global {

	export interface IDatabase {
		watchPlayers(cb: (players: ReadonlyArray<Readonly<IPlayer>>) => void): IDisposable;
		logOnAsync(player: Readonly<Pick<IPlayer, "name" | "gender">>): Promise<IPlayer>;
		logOffAsync(playerId: UserId): Promise<void >;
	}
}
export const database = new FirebaseDatabase();