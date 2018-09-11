import { changeState, observableState } from "./MobX";

declare global {
	interface LogOffPopupState {
		isOpen: boolean;
	}
}

export const logOffPopupState = observableState<LogOffPopupState>({
	isOpen: false,
});

export function openLogOffPopup(data: ObservableState<LogOffPopupState>, shouldOpen = true) {
	return changeState(data, `openLogOffPopup: ${shouldOpen}`, data => {
		data.isOpen = shouldOpen;
	});
}
