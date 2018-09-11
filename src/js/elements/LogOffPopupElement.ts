import { cssRule } from "typestyle/lib";
import { buttonStyle } from "../view/button";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Watch } from "./HyperElement";

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"log-off-click": CustomEvent<{}>;
	}
}

cssRule("log-off-popup", {
	$nest: {

		"& button": {
			...buttonStyle()
		},

		"&[data-gender='male'] button": {
			backgroundColor: theme.malePrimaryColor,
		},

		"&[data-gender='female'] button": {
			backgroundColor: theme.femalePrimaryColor,
		},

	}
});

@Component({tag: "log-off-popup"})
export class LogOffPopupElement extends HyperElement {

	@Attribute({attributeName: "username"})
	public userName: UserName | undefined;

	constructor() {
		super();

		// bind methods to this
		this.logOffButtonClicked = this.logOffButtonClicked.bind(this);
		this.userName = undefined;
	}

	protected logOffButtonClicked(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		const event: HTMLElementEventMap["log-off-click"] = new CustomEvent<{}>("log-off-click", {
			detail: {},
			bubbles: false
		});
		this.dispatchEvent(event);
	}

	@Watch({
		attributeName: "username"
	})
	public render() {
		return this.html`<top-popup close-on-background>
			<span slot="header">Afmelden</span>
			Ben je zeker dat je '${this.userName}' wilt afmelden?
			<button slot="footer" type="submit" onclick=${this.logOffButtonClicked} >Log off</button>
		</top-popup>`;
	}
}