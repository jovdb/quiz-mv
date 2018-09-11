import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { Gender } from "../types/Gender";
import { theme } from "../view/theme";
import { logController } from "./Controller";

/** Make Navigationbar of browser the gender color */
export const navigationBarController = logController(function navigationBarController() {

	function updateNavigationBar() {
		/*
		<!-- Chrome, Firefox OS and Opera -->
		<meta name="theme-color" content="#4285f4">

		<!-- Windows Phone -->
		<meta name="msapplication-navbutton-color" content="#4285f4">

		<!-- iOS Safari -->
		<meta name="apple-mobile-web-app-status-bar-style" content="#4285f4">
		*/

		const themeColor = loggedOnPlayerState.value
			? loggedOnPlayerState.value.gender === Gender.Female
				? theme.femalePrimaryColor
				: theme.malePrimaryColor
			: "";

		function createMeta(name: string) {
			let chromeMetaEl = document.querySelector(`head meta[name="${name}"]`);
			if (!chromeMetaEl) {
				chromeMetaEl = document.createElement("meta");
				chromeMetaEl.setAttribute("name", name);
				document.getElementsByTagName("head")[0].appendChild(chromeMetaEl);
			}
			chromeMetaEl.setAttribute("content", themeColor);
		}

		createMeta("theme-color");
		createMeta("msapplication-navbutton-color");
		createMeta("apple-mobile-web-app-status-bar-style");

	}

	const unsubscribeAutorun = reRunOnStateChange(updateNavigationBar);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
		}
	};
});
