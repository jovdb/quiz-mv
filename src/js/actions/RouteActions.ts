import { database } from "../database/Database";
import { changeState } from "../states/MobX";
import { routeState } from "../states/RouteState";
import { updateTeamBetAsync } from "./BetActions";

const routes = ["players", "intro", "overview", "bet", "bet-wait", "bet-overview", "question"] as ReadonlyArray<Route>;

function getNextRoute(): Route | undefined {
//	if (!isQuizmaster(model.loggedOnPlayer.value)) return undefined;

	let newPage = routes[1];
	const currentPage = routeState.value
		? routeState.value.page
		: undefined;

	if (currentPage) {
		const index = routes.indexOf(currentPage);
		newPage = routes[index + 1];
	}
	return newPage;
}

export function canGoNext(): boolean {
	return !!getNextRoute();
}

export async function goNext() {
	const newRoute = getNextRoute();
	const currentPage = routeState.value
		? routeState.value.page
		: undefined;

	// On page leave
	if (currentPage === "bet-wait") {
		await updateTeamBetAsync(0);
	}

	if (newRoute && newRoute !== currentPage) {

		changeState(routeState, "Marking route loading", routeState => {
			routeState.state = LoadState.Loading;
		});

		await database.setRouteAsync(newRoute);
	}
}

function getPrevRoute(): Route | undefined {

//	if (!isQuizmaster(model.loggedOnPlayer.value)) return undefined;

	const currentPage = routeState.value
		? routeState.value.page
		: undefined;

	if (!currentPage) return undefined;

	const index = routes.indexOf(currentPage);
	return routes[index - 1];
}

export function canGoPrev(): boolean {
	return !!getPrevRoute();
}

export function goPrev(): void {
	const newRoute = getPrevRoute();
	const currentPage = routeState.value
		? routeState.value.page
		: undefined;
	if (newRoute && newRoute !== currentPage) database.setRouteAsync(newRoute);
}

export function goRoute(route: Route): void {
	const currentPage = routeState.value
		? routeState.value.page
		: undefined;
	if (route && route !== currentPage) {
		database.setRouteAsync(route);
	}
}
