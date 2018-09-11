import { cssRule } from "typestyle/lib";
import { Component, HyperElement, Property } from "../elements/HyperElement";
import "../elements/ScoreElement";

cssRule("question-page", {

	// Full page
	position: "absolute",
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,

	$nest: {

		"& score-el": {
			position: "absolute",
			top: "1em",
			left: "1em",
			right: "1em",
		},

		"& .question-title": {
			paddingTop: "3rem",
			paddingBottom: "1rem",
			fontSize: "2rem",
		},

		"& .question-info": {
			paddingTop: "1rem",
			fontStyle: "italic",
		},

	}
});

@Component({tag: "question-page"})
export class QuestionPageElement extends HyperElement {

	@Property()
	public questionNumber?: number;

	@Property()
	public questionTitle?: string;

	@Property()
	public questionDescription?: string;

	@Property()
	public questionInfo?: string;

	public render() {

		return this.html`
			<gender-bg-el>
				<div class="page">
					<score-el></score-el>
					<div class="question-title">${(this.questionNumber || 0) + 1}. ${this.questionTitle}</div>
					<div class="question-description">${this.questionDescription}</div>
					<div class="question-info">${this.questionInfo}</div>
				</div>
			</gender-bg-el>`;
	}
}