import { getStateAndValueMessage } from "../types/LoadStateAndValue";
import { changeState, observableState } from "./MobX";

declare global {
	type FirebaseConnectionState = LoadStateAndValue<boolean>;
}

export const firebaseConnectionState = observableState<FirebaseConnectionState>({
	state: LoadState.NotLoaded,
	value: undefined,
});

export function setFirebaseConnection(data: ObservableState<FirebaseConnectionState>, stateAndValue: Readonly<FirebaseConnectionState>) {
	return changeState(data, `setFirebaseConnection: ${getStateAndValueMessage(stateAndValue)}`, data => {
		data.state = stateAndValue.state;
		data.value = stateAndValue.value;
	});
}