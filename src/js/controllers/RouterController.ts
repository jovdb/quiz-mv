
import { IntroPageElement } from "../pages/IntroPageElement";
import { introPageController } from "./IntroPageController";

import { OverviewPageElement } from "../pages/OverviewPageElement";
import { overviewPageController } from "./OverviewPageController";

import { PlayersPageElement } from "../pages/PlayersPageElement";
import { playersPageController } from "./PlayersPageController";

import { BetPageElement } from "../pages/BetPageElement";
import { betPageController } from "./BetPageController";

import { BetWaitPageElement } from "../pages/BetWaitPageElement";
import { betWaitPageController } from "./BetWaitPageController";

import { BetOverviewPageElement } from "../pages/BetOverviewPageElement";
import { betOverviewPageController } from "./BetOverviewPageController";

import { QuestionPageElement } from "../pages/QuestionPageElement";
import { questionPageController } from "./QuestionPageController";

import { loggedOnPlayerState } from "../states/LoggedOnPlayerState";
import { reRunOnStateChange } from "../states/MobX";
import { routeState } from "../states/RouteState";
import { exhaustiveFail } from "../utils";
import { logController } from "./Controller";

export const routerController = logController(function routerController(routerElement: HTMLElement) {

	let disposable: IDisposable | undefined;
	let lastRoute: Route | undefined;

	function replaceRoute(el?: HTMLElement, controller?: () => IDisposable) {

		const animationDuration = 800;

		// Remove current page
		const currentPage = routerElement.firstChild as HTMLElement;
		const oldDisposable = disposable;
		if (currentPage) {
			currentPage.style.opacity = "0";
			setTimeout(() => {
				if (currentPage.parentNode) currentPage.parentNode.removeChild(currentPage);
				// Unsubscribe old after new so overlap in BalancedScope
				if (oldDisposable) oldDisposable.dispose();
			}, animationDuration + 10);
		}

		// Add new Page
		if (el) {
			const newPage = document.createElement("div");
			newPage.style.transitionDuration = `${animationDuration}ms`;
			newPage.style.transitionProperty = "opacity";
			newPage.style.opacity = "1";
			newPage.appendChild(el);
			routerElement.insertBefore(newPage, routerElement.firstChild);
		}

		disposable = controller ? controller() : undefined;
	}

	function updateRouteElement() {
		const route = loggedOnPlayerState.value
			? routeState.value
				? routeState.value.page
				: undefined
			: undefined;

		// Don't change while loading new route
		if (routeState.state === LoadState.Loading) return;

		// Don't replace with the same route
		if ((lastRoute) === (route || "players")) return;
		lastRoute = route || "players";

		switch (route) {
			case undefined:
			case "players": {
				const el = new PlayersPageElement();
				replaceRoute(el, () => playersPageController(el));
				break;
			}

			case "intro": {
				const el = new IntroPageElement();
				replaceRoute(el, () => introPageController(el));
				break;
			}

			case "overview": {
				const el = new OverviewPageElement();
				replaceRoute(el, () => overviewPageController(el));
				break;
			}

			case "bet": {
				const el = new BetPageElement();
				replaceRoute(el, () => betPageController(el));
				break;
			}

			case "bet-wait": {
				const el = new BetWaitPageElement();
				replaceRoute(el, () => betWaitPageController(el));
				break;
			}

			case "bet-overview": {
				const el = new BetOverviewPageElement();
				replaceRoute(el, () => betOverviewPageController(el));
				break;
			}

			case "question": {
				const el = new QuestionPageElement();
				replaceRoute(el, () => questionPageController(el));
				break;
			}

			default: {
				exhaustiveFail(route);
				break;
			}
		}
	}


	const unsubscribeAutorun = reRunOnStateChange(updateRouteElement);

	// Unsubscribe
	return {
		dispose() {
			unsubscribeAutorun();
		}
	};
});
