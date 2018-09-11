import { database } from "../database/Database";
import { getStateAndValueMessage } from "../types/LoadStateAndValue";
import { changeState, observableState } from "./MobX";
import { executePromiseWithLoadState } from "./StateHelpers";

declare global {
	type LoggedOnPlayerState = LoadStateAndValue<IPlayer>;
}

export const loggedOnPlayerState = observableState<LoggedOnPlayerState>({
	value: undefined,
	state: LoadState.NotLoaded,
});

/** Change local state */
export function setLoggedOnPlayer(data: ObservableState<LoggedOnPlayerState>, stateAndValue: Readonly<LoggedOnPlayerState>) {
	return changeState(data, `setLoggedOnPlayer: ${getStateAndValueMessage(stateAndValue)}`, data => {
		data.state = stateAndValue.state;
		//data.value = observableState(stateAndValue.value);
		data.value = stateAndValue.value;
	});
}

export function canLogOn(): boolean {
	return (
		!loggedOnPlayerState.value &&
		loggedOnPlayerState.state !== LoadState.Loading
	);
}

export function canLogOff(): boolean {
	return !!loggedOnPlayerState.value;
}

/** Add to database and update loggedOnPlayer in state */
export const logOnAsync: IDatabase["logOnAsync"] = async player => {
	return executePromiseWithLoadState(
		async () => database.logOnAsync(player),
		result => {
			setLoggedOnPlayer(loggedOnPlayerState, result);
		}
	);
};

/** Remove from database and update loggedOnPlayer in state */
export const logOffAsync: IDatabase["logOffAsync"] = async playerId => {
	return executePromiseWithLoadState(
		async () => database.logOffAsync(playerId),
		() => {
			setLoggedOnPlayer(loggedOnPlayerState, {state: LoadState.NotLoaded});
		}
	);
};
