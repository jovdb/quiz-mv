import { getStateAndValueMessage } from "../types/LoadStateAndValue";
import { changeState, observableState } from "./MobX";

declare global {
	type ScoreState = LoadStateAndValue<IScore>;
}

export const scoreState = observableState<ScoreState>({
	value: undefined,
	state: LoadState.NotLoaded,
});

export function setScore(data: ObservableState<ScoreState>, stateAndValue: Readonly<ScoreState>) {
	return changeState(data, `setScore: ${getStateAndValueMessage(stateAndValue)}`, data => {
		data.state = stateAndValue.state;
		data.value = stateAndValue.value;
	});
}
