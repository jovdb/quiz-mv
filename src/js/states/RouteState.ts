import { getStateAndValueMessage } from "../types/LoadStateAndValue";
import { changeState, observableState } from "./MobX";

declare global {
	type RouteState = LoadStateAndValue<IRoute>;
}

export const routeState = observableState<RouteState>({
	value: undefined,
	state: LoadState.NotLoaded,
});

export function setRoute(data: ObservableState<RouteState>, stateAndValue: Readonly<RouteState>) {
	return changeState(data, `setRoute: ${getStateAndValueMessage(stateAndValue)}`, data => {
		data.state = stateAndValue.state;
		data.value = stateAndValue.value;
	});
}