import { getStateAndValueMessage } from "../types/LoadStateAndValue";
import { changeState, observableState } from "./MobX";

declare global {
	type PlayersState = LoadStateAndValue<ReadonlyArray<IPlayer>>;
}

export const playersState: PlayersState = observableState<PlayersState>({
	value: undefined,
	state: LoadState.NotLoaded,
});

export function setPlayers(data: ObservableState<PlayersState>, stateAndValue: Readonly<PlayersState>) {
	return changeState(data, `setPlayers: ${getStateAndValueMessage(stateAndValue, v => `${v ? `${v.filter(p => p.isOnline()).length} players` : "undefined"}`)}`, data => {
		data.state = stateAndValue.state;
		data.value = stateAndValue.value;
	});
}