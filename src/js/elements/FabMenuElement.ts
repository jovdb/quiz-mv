import { cssRule } from "typestyle/lib";
import { NestedCSSProperties } from "typestyle/lib/types";
import { focusStyle } from "../view/button";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Watch } from "./HyperElement";

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"fab-menu-click": CustomEvent<{index: number; element: HTMLButtonElement}>;
		"fab-menu-opened": CustomEvent<{isOpen: boolean}>;
	}
}

const iconSize = 1.6;
const transitionDuration = "300ms";

const fabSize = 3;
const fabCircle: NestedCSSProperties = {
	width: `${fabSize}rem`,
	height: `${fabSize}rem`,
	borderRadius: "50%",
	border: "0.1rem solid #ffffff",
	boxShadow: `${1 / 8}rem ${1 / 8}rem ${1 / 4}rem rgba(0, 0, 0, 0.2)`,
};

const focus = focusStyle();

cssRule("fab-menu", {
	$debugName: "fab",

	position: "fixed", // Position relative to view
	left: "50%",
	bottom: `${fabSize - 5}rem`,

	transitionDuration,
	transitionProperty: "transform",

	$nest: {

		"& .fab": {
			...fabCircle,
			...focus,

			position: "absolute",
			top: 0,
			left: 0,

			// Make origin center
			marginLeft: `-${fabSize / 2}rem`,
			marginTop: `-${fabSize / 2}rem`,

			backgroundColor: theme.lightColor,

			transitionDuration,
			transitionProperty: "transform",

			fill: theme.greyColor,
			color: theme.greyColor,

			$nest: {
				...focus.$nest,

				"&:active": {
					transform: "scale(0.9)",

					$nest: {
						"& span": {
							fill: theme.darkTextColor,
						}
					}
				},
				"icon-el": {
					fontSize: "1.5rem"
				}
			}
		},

		"& .fab-bg": {
			...fabCircle,

			position: "absolute",
			top: 0,
			left: 0,

			width: "1rem",
			height: "1rem",
			// Make origin center
			marginLeft: "-0.5rem",
			marginTop: "-0.5rem",

			opacity: 0.3,
			transitionDuration,
			transitionProperty: "transform",
			backgroundColor: theme.lightColor,
			transitionTimingFunction: "ease-out",
		},

		"& .hamburger": {
			position: "relative",
			display: "inline-block",
			width: `${iconSize}rem`,
			height: `${iconSize}rem`,
			marginTop: 2,
		},
		"& .hamburger span": {
			display: "block",
			position: "absolute",
			height: `${iconSize * 0.2}rem`,
			width: `${iconSize}rem`,
			borderRadius: `${iconSize * 2}rem`,
			background: theme.greyColor,
			opacity: 1,
			left: 0,
			transform: "rotate(0)",
			transition: `${transitionDuration} ease-in-out`,

			$nest: {
				"&:nth-child(1)": {
					top: 0
				},
				"&:nth-child(2), &:nth-child(3)": {
					top: `${iconSize * 0.4}rem`
				},
				"&:nth-child(4)": {
					top: `${iconSize * 0.8}rem`
				}
			}
		},

		"& .fab-buttons": {
			opacity: 0,
			pointerEvents: "none",
			transitionDelay: transitionDuration, // delay opacity
			transitionProperty: "opacity",
		},

		"&:not([hide])": {
			transform: "translateY(-5rem)",
		},

		// When opened
		"&[opened]": {
			$nest: {
				"& .hamburger span:nth-child(1)": {
					top: `${iconSize * 0.4}rem`,
					width: 0,
					left: `${iconSize * 0.5}rem`
				},
				"& .hamburger span:nth-child(4)": {
					top: `${iconSize * 0.4}rem`,
					width: 0,
					left: `${iconSize * 0.5}rem`
				},
				"& .hamburger span:nth-child(2)": {
					transform: "rotate(45deg)"
				},
				"& .hamburger span:nth-child(3)": {
					transform: "rotate(-45deg)"
				},

				"& .fab-bg": {
					transform: "scale(14.5)",
					transitionTimingFunction: "cubic-bezier(0.24, 1.14, 1, 1)",
				},

				"& .fab-buttons": {
					opacity: 1,
					pointerEvents: "auto",
					transitionDelay: "0s", // remove delay
				},

				"& .fab-buttons .fab:nth-child(1)": {
					transform: "translate(-100%, -100%)",

					$nest: {
						"&:active": {
							transform: "translate(-100%, -100%) scale(0.9)",
							fill: theme.darkTextColor
						}
					}
				},

				"& .fab-buttons .fab:nth-child(2)": {
					transform: "translate(100%, -100%)",

					$nest: {
						"&:active": {
							transform: "translate(100%, -100%) scale(0.9)",
							fill: theme.darkTextColor
						}
					}
				},
			}
		}

	}
});

@Component({ tag: "fab-menu" })
export class FabMenuElement extends HyperElement {

	constructor() {
		super();

		this.loadSlots();

		// bind methods to this
		this.fabButtonClicked = this.fabButtonClicked.bind(this);
		this.childButtonClicked = this.childButtonClicked.bind(this);
	}


	/** Open/Close the fab menu */
	@Attribute({ attributeName: "opened", type: "boolean" })
	public isOpen?: boolean;

	/** Open/Close the fab menu */
	@Attribute({ attributeName: "hide", type: "boolean" })
	public hide?: boolean;

	@Watch({ attributeName: "opened" })
	protected onAttributeOpenedChange(_attrName: string, _oldVal: string, _newVal: string): void {

		// TODO: test recursive loop?
		// notify state is changed
		const event: HTMLElementEventMap["fab-menu-opened"] = new CustomEvent("fab-menu-opened", {
			detail: {
				isOpen: !!this.isOpen
			}, bubbles: false
		});
		this.dispatchEvent(event);
	}

	/** toggle open state */
	protected fabButtonClicked(e: MouseEvent) {
		e.stopPropagation();
		this.isOpen = !this.isOpen;
	}

	protected childButtonClicked(e: MouseEvent) {
		e.stopPropagation();
		const event: HTMLElementEventMap["fab-menu-click"] = new CustomEvent("fab-menu-click", {
			detail: {
				element: e.currentTarget as HTMLButtonElement,
				index: parseInt((e.currentTarget as HTMLButtonElement).getAttribute("data-index") || "0", 10),
			}, bubbles: false
		});
		this.dispatchEvent(event);
	}

	public render() {
		return this.html`
		<div class="fab-bg"></div>
		<div class="fab-buttons">${this.slots["fab-item"]
			? this.slots["fab-item"].map((fabItem, index) => hyperHTML.wire(this, `id:${index}`)`<button class="fab fab-button" data-index="${index}" onclick="${this.childButtonClicked}">${fabItem}</button>`)
			: ""
		}</div>
		<button class="fab" onclick=${this.fabButtonClicked}>
			<div class="hamburger">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</button>`;
	}
}