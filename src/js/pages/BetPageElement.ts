import { cssRule } from "typestyle/lib";
import { Component, HyperElement, Property } from "../elements/HyperElement";
import "../elements/ScoreElement";
import { buttonStyle, clickableStyle } from "../view/button";
import { theme } from "../view/theme";

cssRule("bet-page", {

	// Full page
	position: "absolute",
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,

	$nest: {
		"& .question-title": {
			fontSize: "2rem",
		},

		"& player-el > button": {
			...clickableStyle(),
			"-webkit-tap-highlight-color": "transparent",
			backgroundColor: theme.lightColor,
			color: theme.darkTextColor,
			boxShadow: theme.boxShadow,
		},

		"& player-el > button:focus": {
			color: "orange",
		},

		"& player-el.selected > button": {
			backgroundColor: "orange",
			color: theme.lightTextColor,
		},

		"& .points": {
			display: "flex",

			$nest: {
				"& > button": {
					...buttonStyle(),
					"-webkit-tap-highlight-color": "transparent",
					width: "100%",
					border: "none",
					backgroundColor: theme.lightColor,
					color: theme.darkTextColor,
					fontSize: "1rem",
					margin: "0.5rem",
					padding: "0.5rem",
					boxShadow: theme.boxShadow,
					borderRadius: "1rem",
				},

				"& > button.selected": {
					backgroundColor: "orange",
					color: theme.lightTextColor,
				},
			}
		}
	}
});

@Component({tag: "bet-page"})
export class BetPageElement extends HyperElement {

	@Property()
	public secondsRemaining?: number;

	@Property()
	public questionNumber?: number;

	@Property()
	public questionTitle?: string;

	@Property()
	public players?: ReadonlyArray<IPlayer>;

	@Property()
	public selectedPlayerId?: UserId;

	@Property()
	public selectedBet?: number;

	@Property()
	public ourScore?: number;

	@Property()
	public enemyScore?: number;

	public render() {

		const myTeamPlayers = (this.players || [])
			.map(p => hyperHTML.wire(this, `:player-${p.id}`)`
				<player-el name="${p.name}" class="${p.id === this.selectedPlayerId ? "selected" : ""}" onclick=${() => this.selectedPlayerId = p.id}/>
			`);

		return this.html`
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<p class="please-bet">Gelieve in te zetten... ${this.secondsRemaining !== undefined ? `${this.secondsRemaining}s` : "" }</p>
				<div class="question-title">${(this.questionNumber || 0) + 1}. ${this.questionTitle}</div>

				<p class="choose-player">Kies speler:</p>
				<div class="players">
					${myTeamPlayers}
				</div>

				<p class="choose-points">Inzet:</p>
				<div class="points">
					<button onclick=${() => {this.selectedBet = 0.05; }} class="${this.selectedBet === 0.05 ? "selected" : ""}">5%</button>
					<button onclick=${() => {this.selectedBet = 0.1; }} class="${this.selectedBet === 0.1 ? "selected" : ""}">10%</button>
					<button onclick=${() => {this.selectedBet = 0.15; }} class="${this.selectedBet === 0.15 ? "selected" : ""}">15%</button>
				</div>

				<div>
					${this.enemyScore && this.selectedBet ? `winst: +${Math.floor(this.enemyScore * this.selectedBet)} punten, ` : ""}
					${this.ourScore && this.selectedBet ? `verlies: -${Math.floor(this.ourScore * this.selectedBet)} punten.` : ""}
				</div>

			</div>
		</gender-bg-el>

		`;
	}
}