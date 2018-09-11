import { Component, HyperElement } from "../elements/HyperElement";
import "../elements/ScoreElement";

@ Component({tag: "overview-page"})
export class OverviewPageElement extends HyperElement {

	public render() {
		return this.html`
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<h1>Overzicht:</h1>
				<ol>
					${game.questions.map((question, index) => hyperHTML.wire(this, `id:${index}`)`
						<li>${question.title}</li>
					`)}
				</ol>
			</div>
		</gender-bg-el>
		`;
	}
}