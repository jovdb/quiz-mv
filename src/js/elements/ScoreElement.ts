import { cssRule } from "typestyle/lib";
import { Gender } from "../types/Gender";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement, Watch } from "./HyperElement";
import "./IconElement";


cssRule("score-el", {

	position: "relative",
	display: "block",
	overflow: "hidden",
	border: `0.15em solid ${theme.lightTextColor}`,
	borderRadius: "0.15em",
	$nest: {
		"& > div": {
			position: "absolute",
			top: 0,
			left: 0,
			height: "100%",
			width: "100%",
			//transitionProperty: "transform",
			//transitionDuration: "300ms",
		},

		"& icon-el": {
			padding: "0 0.3em 0.15em 0.3em",
		},

		"& > .left-value": {
			float: "left",
			position: "relative",
			fill: theme.lightTextColor,
		},

		"& > .right-value": {
			float: "right",
			position: "relative",
			fill: theme.lightTextColor,
		},

		"& > .center": {
			position: "absolute",
			top: 0,
			left: "50%",
			width: "0.1em",
			height: "100%",
			backgroundColor: theme.lightTextColor,
		},

		"& > .male": {
			backgroundColor: theme.malePrimaryColor,
		},

		"& > .female": {
			backgroundColor: theme.femalePrimaryColor,
		},
	}
});

@Component({tag: "score-el"})
export class ScoreElement extends HyperElement {

	private lastLeftValue?: number;
	private lastRightValue?: number;

	@Attribute({type: "number", attributeName: "female-score"})
	public femaleScore?: number;

	@Attribute({type: "number", attributeName: "male-score"})
	public maleScore?: number;

	@Attribute({type: "string", attributeName: "gender"})
	public gender?: Gender;

	@Watch({attributeName: ["female-score", "male-score", "gender"]})
	public render() {

		const leftValue = this.gender
			? this.gender === Gender.Male
				? this.maleScore || 0
				: this.femaleScore || 0
			: 0;

		const rightValue = this.gender
			? this.gender === Gender.Male
				? this.femaleScore || 0
				: this.maleScore || 0
			: 0;

		// Increment left
		const lastLeftValue = this.lastLeftValue = this.lastLeftValue || leftValue;
		const currentLeftValue = leftValue;
		let hasNewLeftValue = true;
		if (lastLeftValue < currentLeftValue) this.lastLeftValue += 1;
		else if (lastLeftValue > currentLeftValue) this.lastLeftValue -= 1;
		else hasNewLeftValue = false;

		// Increment right
		const lastRightValue = this.lastRightValue = this.lastRightValue || rightValue;
		const currentRightValue = rightValue;
		let hasNewRightValue = true;
		if (lastRightValue < currentRightValue) this.lastRightValue += 1;
		else if (lastRightValue > currentRightValue) this.lastRightValue -= 1;
		else hasNewRightValue = false;

		const totalValue = this.lastLeftValue + this.lastRightValue;
		const rightPercent = this.lastRightValue * 100 / totalValue;

		// RAF
		if (hasNewLeftValue || hasNewRightValue) requestAnimationFrame(() => this.render());


		const leftGender = this.gender
			? this.gender === Gender.Male
				? "male"
				: "female"
			: "";

		const rightGender = this.gender
			? this.gender === Gender.Male
				? "female"
				: "male"
			: "";

		return this.html`
			<div class="${`left ${leftGender}`}"></div>
			<div class="${`right ${rightGender}`}" style="${`transform: translateX(${100 - rightPercent}%)`}"></div>
			<div class="center"></div>

			<span class="left-value"><icon-el name="${leftGender}"/>${this.lastLeftValue}</span>
			<span class="right-value">${this.lastRightValue}<icon-el name="${rightGender}"/></span>
		`;
	}
}