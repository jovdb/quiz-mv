import { cssRule } from "typestyle/lib";
import { NestedCSSProperties } from "typestyle/lib/types";
import { focusStyle } from "../view/button";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Property } from "./HyperElement";
import "./IconElement";

const fabSize = 3;

const focus = focusStyle();
const fabCircle: NestedCSSProperties = {
	...focus,

	width: `${fabSize}rem`,
	height: `${fabSize}rem`,
	borderRadius: "50%",
	border: "0.1rem solid #ffffff",
	boxShadow: `${1 / 8}rem ${1 / 8}rem ${1 / 4}rem rgba(0, 0, 0, 0.2)`,
};

cssRule("navigation-el", {
	position: "fixed",
	bottom: "4.5rem",
	width: "100%",

	$nest: {

		"& button": {
			...fabCircle,

			position: "absolute",

			opacity: 1,
			transitionProperty: "transform, opacity",
			transitionDuration: "300ms",
			backgroundColor: "#ffffff",

			fill: theme.greyColor,
			color: theme.greyColor,

			$nest: {
				...fabCircle.$nest,
				"&:active": {
					$nest: {
					}
				},
				"icon-el": {
					fontSize: "1.5rem"
				}
			}

		},

		"& button[disabled]": {
			opacity: 0.3,
		},

		"& button.left": {
			left: "-4rem",
		},

		"& button.right": {
			right: "-4rem",
		},

		"&:not([hide]) button.left": {
			transform: "translateX(6rem)",
		},

		"&:not([hide]) button.right": {
			transform: "translateX(-6rem)",
		},

		"&:not([hide]) button.left:active": {
			transform: "translateX(6rem) scale(0.9)",
		},

		"&:not([hide]) button.right:active": {
			transform: "translateX(-6rem) scale(0.9)",
		},

	}
});

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"navigation-el-left-click": CustomEvent<{}>;
		"navigation-el-right-click": CustomEvent<{}>;
	}
}

@Component({tag: "navigation-el"})
export class NavigationElement extends HyperElement {

	constructor() {
		super();
		this.navLeftClicked = this.navLeftClicked.bind(this);
		this.navRightClicked = this.navRightClicked.bind(this);
	}

	@Attribute({type: "boolean"})
	public hide?: boolean;

	@Property()
	public disablePrev?: boolean;

	@Property()
	public disableNext?: boolean;


	protected navLeftClicked(e: MouseEvent) {
		e.stopPropagation();
		const event: HTMLElementEventMap["navigation-el-left-click"] = new CustomEvent<{}>("navigation-el-left-click", {});
		this.dispatchEvent(event);
	}

	protected navRightClicked(e: MouseEvent) {
		e.stopPropagation();
		const event: HTMLElementEventMap["navigation-el-right-click"] = new CustomEvent<{}>("navigation-el-right-click", {});
		this.dispatchEvent(event);
	}

	public render() {
		return this.html`
			<button class="left" onclick="${this.navLeftClicked}" disabled="${this.disablePrev}"><icon-el name="arrowLeft"></icon-el></button>
			<button class="right" onclick="${this.navRightClicked}" disabled="${this.disableNext}"><icon-el name="arrowRight"></icon-el></button>
		`;
	}
}