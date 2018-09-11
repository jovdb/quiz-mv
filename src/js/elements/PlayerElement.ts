import { cssRule, keyframes } from "typestyle/lib";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Watch } from "./HyperElement";


cssRule("player-el", {
	$nest: {
		"&[is-me] > button": {
			animationDuration: "2s",
			animationIterationCount: "infinite",
			animationName: keyframes({
				"0%": {backgroundColor: "rgba(0, 0, 0, 0.2)"},
				"50%": {backgroundColor: "rgba(0, 0, 0, 0.25)"},
				"100%": {backgroundColor: "rgba(0, 0, 0, 0.2)"},
			})
		},

		"> button": {
			fontFamily: theme.fontFamily,
			fontSize: "1rem",
			display: "inline-block",
			marginTop: "0.3rem",
			marginBottom: "0.3rem",
			margin: "0.5rem",
			padding: "0.5rem",
			borderRadius: "1rem",
			border: "none",
			color: "rgba(255,255,255,0.8)",
			backgroundColor: "rgba(0, 0, 0, 0.1)",
		},

		"> button:focus": {
			outline: "none"
		}
	}
});

@Component({tag: "player-el"})
export class PlayerElement extends HyperElement {

	@Attribute()
	public name?: string;

	@Attribute({
		attributeName: "is-me",
		type: "boolean"
	})
	public isMe?: boolean;

	@Watch({
		attributeName: ["name", "is-me"]
	})
	public render() {
		return this.html`<button>
			${this.name}
		</button>`;
	}
}