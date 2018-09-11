import { changeState, observableState } from "./MobX";

declare global {
	interface FabMenuState {
		isOpen: boolean;
	}
}

export const fabMenuState = observableState<FabMenuState>({
	isOpen: false,
});

export function openFabMenu(data: ObservableState<FabMenuState>, shouldOpen = true) {
	return changeState(data, `openFabMenu: ${shouldOpen}`, data => {
		data.isOpen = shouldOpen;
	});
}