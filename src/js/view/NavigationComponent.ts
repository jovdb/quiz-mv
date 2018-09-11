import { style } from "typestyle/lib";
import { broadcaster } from "../broadcaster";
import { actions } from "../dashboard/Actions";
import { BaseComponent, comp } from "./BaseComponent";
import { watchFabOpened } from "./FabComponent";
import { icon, IconNames } from "./icon";
import { RoundButtonComponent } from "./RoundButtonComponent";
import { Route } from "./RouterComponent";

const navigateNextAction = {
	name: "NavigateNext",
	canExecError: (currentRoute: Route) => currentRoute === Route.Intro ? "You are already at the end" : "",
	exec() {
		actions.changeRoute.exec({route: Route.Intro});
	}
};
actions.navigateNext = navigateNextAction;

const navigatePreviousAction = {
	name: "NavigatePrevious",
	canExecError: (currentRoute: Route) => currentRoute === Route.Players ? "You are already at the start" : "",
	exec() {
		actions.changeRoute.exec({route: Route.Players});
	}
};
actions.navigatePrevious = navigatePreviousAction;


declare global {

	// Augment Actions
	interface IActions {
		"navigatePrevious": typeof navigatePreviousAction;
		"navigateNext": typeof navigateNextAction;
	}
}

export class NavigationComponent extends BaseComponent {

	private rootClassName: string;
	private shouldHide: boolean;
	private currentRoute: Route;
	private previousButton: RoundButtonComponent;
	private nextButton: RoundButtonComponent;

	constructor() {
		super();
		this.shouldHide = false;
		this.currentRoute = Route.Players;

		// Bind event handlers
		this.previousButtonClicked = this.previousButtonClicked.bind(this);
		this.nextButtonClicked = this.nextButtonClicked.bind(this);

		const buttonSize = 3;
		this.previousButton = new RoundButtonComponent({
			onClick: this.previousButtonClicked,
			isDisabled: true,
			children: icon(IconNames.ArrowLeft),
			style: {
				left: `${-buttonSize / 2}rem`, // Center button
				marginLeft: "-4rem"
			}
		});
		this.nextButton = new RoundButtonComponent({
			onClick: this.nextButtonClicked,
			isDisabled: true,
			children: icon(IconNames.ArrowRight),
			style: {
				left: `${-buttonSize / 2}rem`, // Center button
				marginLeft: "4rem"
			}
		});

		this.rootClassName = style({
			$debugName: "navigation",

			$nest: {
				"& .fab-buttons": {
					position: "fixed",
					bottom: "4rem",
					left: "50%",

					transitionProperty: "opacity",
					transitionDelay: "50ms",
					transitionDuration: "50ms",

				},

				"&.hide .fab-buttons": {
					opacity: 0
				}
			}
		});
	}

	public attached() {

		const unsubscribeFab = watchFabOpened(fabOpened => {
			this.shouldHide = fabOpened;
			this.invalidate();
		}).start();

		const unsubscribeChangeRoute = broadcaster.subscribeOnMessage("ChangeRoute", message => {
			this.currentRoute = message.route;

			const shouldDisablePrevious = !!actions.navigatePrevious.canExecError(this.currentRoute);
			if (this.previousButton.isDisabled !== shouldDisablePrevious) {
				this.previousButton.isDisabled = shouldDisablePrevious;
				this.previousButton.invalidate();
			}

			const shouldDisableNext = !!actions.navigateNext.canExecError(this.currentRoute);
			if (this.nextButton.isDisabled !== shouldDisableNext) {
				this.nextButton.isDisabled = shouldDisableNext;
				this.nextButton.invalidate();
			}
		});

		return () => {
			unsubscribeFab();
			unsubscribeChangeRoute();
		};
	}

	private previousButtonClicked() {
		if (!actions.navigatePrevious.canExecError(this.currentRoute)) {
			actions.navigatePrevious.exec();
		}
		return true;
	}

	private nextButtonClicked() {
		if (!actions.navigateNext.canExecError(this.currentRoute)) {
			actions.navigateNext.exec();
		}
		return true;
	}

	public getTemplate() {
		return html`<div class$="${this.rootClassName} ${this.shouldHide ? "hide" : ""}">
			<div class="fab-buttons">
				${comp(this.previousButton)}
				${comp(this.nextButton)}
			</div>
		</div>`;
	}
}
