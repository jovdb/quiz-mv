declare global {

	export interface IQuestion {
		title: string;
		description: string;
		info?: string;
	}

	export interface IGame {
		questions: ReadonlyArray<IQuestion>;
	}

	export const game: IGame;
}

export const _ = undefined;