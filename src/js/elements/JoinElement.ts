import { cssRule, keyframes } from "typestyle/lib";
import { buttonStyle } from "../view/button";
import { Attribute, Component, HyperElement, Property } from "./HyperElement";

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"join-el-click": CustomEvent<{element: HTMLButtonElement}>;
	}
}

const transitionDuration = "300ms";

cssRule("join-el", {

	position: "fixed", // Position relative to view
	left: "50%",
	bottom: `${-5 + 2}rem`,

	transitionDuration,
	transitionProperty: "transform",

	$nest: {
		"&:not([hide])": {
			transform: "translateY(-5rem)",
		},

		button: {
			...buttonStyle(),

			boxShadow: "0 0 2rem rgba(0, 0, 0, 0.5)",
		},

		div: {

			display: "inline-block", // No 100% width
			marginLeft: "-50%",

			// Pulsate
			animationDuration: "3000ms",
			animationDelay: "2s",
			animationIterationCount: "infinite",
			animationName: keyframes({
				"0%": { transform: "scale(1)" },
				"80%": { transform: "scale(1)" },
				"90%": { transform: "scale(1.2)" },
				"100%": { transform: "scale(1)" },
			})
		}
	}
});

@Component({ tag: "join-el" })
export class JoinElement extends HyperElement {

	constructor() {
		super();

		// bind methods to this
		this.joinButtonClicked = this.joinButtonClicked.bind(this);
	}

	/** Open/Close the fab menu */
	@Attribute({ attributeName: "hide", type: "boolean" })
	public hide?: boolean;

	/** Open/Close the fab menu */
	@Property()
	public buttonText?: string;

	/** toggle open state */
	protected joinButtonClicked(e: MouseEvent) {
		e.stopPropagation();
		const event: HTMLElementEventMap["join-el-click"] = new CustomEvent("join-el-click", {
			detail: {
				element: e.currentTarget as HTMLButtonElement
			}, bubbles: false
		});
		this.dispatchEvent(event);
	}

	public render() {
		return this.html`
		<div>
			<button onclick=${this.joinButtonClicked}>
				${this.buttonText || ""}
			</button>
		</div>`;
	}
}