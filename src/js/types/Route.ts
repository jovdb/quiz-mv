import { exhaustiveFail } from "../utils";

declare global {
	type Route = "players" | "intro" | "overview" | "bet" | "bet-wait" | "bet-overview" | "question";

	interface IRoute {
		page: Route;
		questionNumber: number;
	}
}

export namespace Route {

	export function validate(route: "" | null | undefined): never;
	export function validate(route: string | null | undefined): string;
	export function validate(route: string | null | undefined): string {

		const r = route as Route;

		// Validation
		if (
			r === "players" ||
			r === "intro" ||
			r === "overview" ||
			r === "bet" ||
			r === "bet-wait" ||
			r === "bet-overview" ||
			r === "question"
		) {
			return "";
		} else {
			exhaustiveFail(r, true);
			return `Unsupported route value: '${route}'`;
		}
	}

	export function isValid(route?: string | null | undefined): route is Route {
		return !validate(route);
	}
}
