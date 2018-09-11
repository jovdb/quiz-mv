import { changeState, observableState } from "./MobX";

declare global {
	interface LogOnPopupState {
		isOpen: boolean;
	}
}

export const logOnPopupState = observableState<LogOnPopupState>({
	isOpen: false,
});

export function openLogOnPopup(data: ObservableState<LogOnPopupState>, shouldOpen = true) {
	return changeState(data, `openLogOnPopup: ${shouldOpen}`, data => {
		data.isOpen = shouldOpen;
	});
}
