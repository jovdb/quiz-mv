import { cssRule, keyframes } from "typestyle/lib";
import { Component, HyperElement } from "./HyperElement";

const animation = keyframes({
	"0%": {
		transform: "translateY(0)"
	},
	"80%": {
		transform: "translateY(0)"
	},
	"90%": {
		transform: "translateY(-1rem)"
	},
	"100%": {
		transform: "translateY(0)"
	}
});
cssRule("block-input", {

	position: "fixed",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	pointerEvents: "none",
	backgroundColor: "rgba(255, 255, 255, 0.3)",
	opacity: 0,
	transitionProperty: "opacity",
	transitionDuration: "1s",

	$nest: {

		"&.active": {
			pointerEvents: "auto",
		},

		"&.visible": {
			opacity: 1,
		},

		".block-input__dot": {

			width: "1rem",
			height: "1rem",
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			borderRadius: "50%",

			position: "absolute",
			top: "50%",
			left: "50%",
			animationName: animation,
			animationIterationCount: "infinite",
			animationTimingFunction: "ease-in-out",
			animationDuration: "1s",
		},

		".block-input__dot:nth-child(1)": {
			marginLeft: "-2.5rem",
			animationDelay: "-0.1s",
		},

		".block-input__dot:nth-child(2)": {
			marginLeft: "-0.5rem",
		},

		".block-input__dot:nth-child(3)": {
			marginLeft: "1.5rem",
			animationDelay: "0.1s",
		}
	}
});

@Component({tag: "block-input"})
export class BlockInputElement extends HyperElement {

	public render() {
		return this.html`
			<div class="block-input__dot"></div>
			<div class="block-input__dot"></div>
			<div class="block-input__dot"></div>
		`;
	}
}