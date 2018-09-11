import { cssRule } from "typestyle/lib";
import { setFocusableChilds } from "../utils";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Watch } from "./HyperElement";

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"popup-bg-click": CustomEvent<undefined>;
	}
}

const transitionDuration = "300ms";
const shadowSize = "3em";

cssRule("top-popup", {
	$debugName: "topPopup",
	position: "absolute",
	width: "100%",
	bottom: `calc(100% + ${shadowSize})`,
	textAlign: "center",
	fontFamily: theme.fontFamily,
	fontSize: "1rem",

	$nest: {
		"& .popup": {
			display: "inline-block",
			bottom: `calc(100% + ${shadowSize})`,
			transform: "translateY(0%)",
			transitionProperty: "transform",
			transitionDuration,
			transitionTimingFunction: "ease-in-out",
			borderBottomLeftRadius: "1rem",
			borderBottomRightRadius: "1rem",
			margin: "0 1rem 0.5rem 1rem",
			padding: "2rem",
			backgroundColor: "#ffffff",
			boxShadow: `0 0 ${shadowSize} rgba(0, 0, 0, 0.4)`,
		},

		"& .popup__popop-header": {
			marginBottom: "1em",
			fontSize: "1.5rem",
			fontWeight: "bold",
		},

		"& .popup__popop-footer": {
			marginTop: "1em",
		},

		"& .popup-background": {
			display: "none",
			position: "fixed",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
		},

		"&[opened] > .popup": {
			transform: `translateY(calc(100% + ${shadowSize}))`,
		},

		"&[opened] > .popup-background": {
			display: "block",
		},
	}
});

@Component({tag: "top-popup"})
export class TopPopupElement extends HyperElement {

	constructor() {
		super();
		this.loadSlots();
		this.backgroundClicked = this.backgroundClicked.bind(this);
	}

	@Attribute({
		attributeName: "opened",
		type: "boolean"
	})
	public isOpened?: boolean;

	/** toggle open state */
	protected backgroundClicked() {
		const event: HTMLElementEventMap["popup-bg-click"] = new CustomEvent("popup-bg-click", {
			detail: undefined,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	public connectedCallback() {
		super.connectedCallback();
		setFocusableChilds(this, !!this.isOpened);
	}

	public render() {
		return this.html`
		<div class="popup-background" onClick=${this.backgroundClicked}></div>
		<div class="popup">
			${this.slots.header && this.slots.header.length > 0
				? hyperHTML.wire()`<div class="popup__popop-header">${this.slots.header}</div>`
				: ""
			}
			${this.slots.default && this.slots.default.length > 0
				? this.slots.default
				: ""
			}
			${this.slots.footer && this.slots.footer.length > 0
				? hyperHTML.wire()`<div class="popup__popop-footer">${this.slots.footer}</div>`
				: ""
			}
		</div>`;
	}

	@Watch({attributeName: "opened"})
	protected openedChanged() {
		setFocusableChilds(this, !!this.isOpened);
	}
}