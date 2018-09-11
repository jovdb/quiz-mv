import { exhaustiveFail } from "../utils";

declare global {

	const enum LoadState {
		/** Related value is not loaded */
		NotLoaded = "not-loaded",

		/** Related value is busy loading */
		Loading = "loading",

		/** Related value is loaded and usable */
		Loaded = "loaded",

		/** Related is loaded with an error */
		Error = "error"
	}

	type LoadStateAndValue<T> =
	| {
		state: LoadState.NotLoaded;
		value?: undefined;
	}
	| {
		state: LoadState.Loading;
		value?: undefined;
	}
	| {
		state: LoadState.Loaded;
		value: T;
	}
	| {
		state: LoadState.Error;
		value?: undefined;
	};

	/*
	export interface IQuestionPlayersBet {
		readonly [playerId: string]: IGenderBet | undefined;
	}

	export interface IQuestionsPlayersBet {
		readonly [questionNumber: number]: LoadStateAndValue<IQuestionPlayersBet> | undefined;
	}*/

}

export function getStateAndValueMessage<T>(stateAndValue: LoadStateAndValue<T> | undefined, getLogValue: (value: T) => string = value => JSON.stringify(value)) {
	if (!stateAndValue) return `${undefined}`;
	const state = stateAndValue.state;
	if (state === LoadState.NotLoaded) return "Not available";
	if (state === LoadState.Loading) return "Loading...";
	if (state === LoadState.Error) return "Error";
	if (state === LoadState.Loaded) return `Loaded: ${getLogValue(stateAndValue.value!)}`;
	return exhaustiveFail(state);
}
