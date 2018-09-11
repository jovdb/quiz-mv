import { PlayersPageElement } from "../pages/PlayersPageElement";
import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { playersState } from "../states/PlayersState";
import { assert, combineUnsubscribes } from "../utils";
import { logController } from "./Controller";
import { joinController } from "./JoinButtonController";

export const playersPageController = logController(function playersPageController(playersPageElement: PlayersPageElement) {

	const unsubscribeJoinButton = joinController(assert(document.querySelector("join-el")) as any).dispose;

	function scrollToMe() {
		if (!loggedOnPlayerState || ! loggedOnPlayerState.value) return false;
		const playerEl = playersPageElement.querySelector(`player-el[name='${loggedOnPlayerState.value.name}']`);
		if (playerEl) playerEl.scrollIntoView({ behavior: "smooth" });
		return !!playerEl;
	}

	// Set View Properties
	let shouldScrollToMe = false;

	// Update players
	function updatePlayers() {
		playersPageElement.isLoading = (playersState.state === LoadState.Loading);
		playersPageElement.players = playersState.value;

		// Update after loggedOnPlayer should scroll to me
		if (shouldScrollToMe) {
			scrollToMe();
			shouldScrollToMe = false;
		}
	}

	// Watch Loggedon Player
	function updateLoggedOnPlayerOnPlayersPage() {
		const loggedOnPlayer = loggedOnPlayerState.value;
		playersPageElement.loggedOnUser = loggedOnPlayer;

		// Scroll me in view
		if (loggedOnPlayer) {
			shouldScrollToMe = !scrollToMe();
		}
	}

	const unsubscribeAutorun = combineUnsubscribes([
		reRunOnStateChange(updateLoggedOnPlayerOnPlayersPage),
		reRunOnStateChange(updatePlayers),
	]);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
			unsubscribeJoinButton();
		}
	};
});
