import { cssRule } from "typestyle/lib";

import "./types/Disposable";
import "./types/hyperHTML";
import "./types/TypeOf";

import { aiController } from "./controllers/AIController";
import { blockInputController } from "./controllers/BlockInputController";
import { fabMenuController } from "./controllers/FabMenuController";
import { logOffPopupController } from "./controllers/LogOffPopupController";
import { logOnPopupController } from "./controllers/LogOnPopupController";
import { navigationBarController } from "./controllers/NavigationBarController";
import { navigationController } from "./controllers/NavigationController";
import { routerController } from "./controllers/RouterController";
import { vibrationController } from "./controllers/VibrationControler";

import "./elements/BlockInputElement";
import "./elements/FabMenuElement";
import "./elements/GenderBackgroundElement";
import "./elements/IconElement";
import "./elements/JoinElement";
import "./elements/LogOffPopupElement";
import "./elements/LogOnPopupElement";
import "./elements/NavigationElement";
import "./elements/TopPopupElement";

import "./types/Game";
import { assert, subscribeToEvent } from "./utils";
import { theme } from "./view/theme";

import { log } from "./logger";
import "./states/DebugState";

cssRule("body", {
	margin: 0
});

cssRule(".pages", {
	position: "absolute",
	width: "100%",
	height: "100%",
});

cssRule(".page", {
	fontFamily: theme.fontFamily,
	fontSize: "1rem",
	padding: "1em",
	paddingBottom: "4em", // for FAB button
	color: theme.lightTextColor,

	$nest: {
		a: {
			color: theme.lightTextColor,
		},
		"a:visited": {
			color: theme.lightTextColor,
		}
	}
});


export class App {

	private appEl: HTMLElement;

	constructor () {
		this.appEl = document.getElementById("app")!;
		log("Add a 'live expression' to 'Object.keys(state.activeSubscriptions)' to see is everything is properly unsubscribed.");

		addEventListener("error", e => {
			alert(`Er is en fout opgetreden${e.error ? `:\n${e.error.stack}` : `${e.message}.`}`);
		});

		this.update();

		// Update
		addEventListener("resize", () => this.calculateRem());
		addEventListener("orientationChange", () => this.calculateRem());
		this.calculateRem();

		// Detect if mouse is available
		const unsubscribeMouseMove = subscribeToEvent(window, "mousemove", () => {
			this.appEl.classList.add("has-mouse");
			unsubscribeMouseMove();
		}, false);


	}

	private calculateRem() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const area = width * height;
		const fontSize = Math.round(Math.max(Math.min(area / 40000 + 10, 36), 16));
		document.querySelector<HTMLElement>(":root")!.style.fontSize = `${fontSize}px`;
	}

	private update() {

		hyperHTML.bind(this.appEl)`
		<div class="pages"/>
		<fab-menu id="fab" hide>
			<span slot="fab-item" class="toggleLogOn"><icon-el name="user"></icon-el></span>
			<span slot="fab-item"><icon-el name="crown"></icon-el></span>
		</fab-menu>
		<join-el hide/>
		<log-off-popup/>
		<log-on-popup/>
		<block-input></block-input>
		<navigation-el hide></navigation-el>`;

		vibrationController();
		navigationBarController();
		navigationController(assert(document.querySelector("navigation-el")) as any);
		logOffPopupController(assert(document.querySelector("log-off-popup")) as any);
		logOnPopupController(assert(document.querySelector("log-on-popup")) as any);
		blockInputController(assert(document.querySelector("block-input")) as any);
		fabMenuController(assert(document.getElementById("fab")) as any);
		routerController(assert(document.querySelector(".pages")) as any);
		aiController();

	}

}

export const app: {} = new App();