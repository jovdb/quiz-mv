import { fabMenuState } from "./FabMenuState";
import { loggedOnPlayerState } from "./LoggedOnPlayerState";
import { logOffPopupState } from "./LogOffPopupState";
import { logOnPopupState } from "./LogOnPopupState";
import { activeSubscriptions } from "./MobX";
import { playersState } from "./PlayersState";
import { routeState } from "./RouteState";

// For debug purpose
(window as any).state = {
	players: playersState,
	loggedOnPlayer: loggedOnPlayerState,
	route: routeState,
	ui: {
		fabMenu: fabMenuState,
		logOnPopup: logOnPopupState,
		logOffPopup: logOffPopupState,
	},

	/** For debugging: view all watching functions */
	activeSubscriptions,
};