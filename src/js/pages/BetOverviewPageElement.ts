import { cssRule, keyframes } from "typestyle/lib";
import { Component, HyperElement, Property } from "../elements/HyperElement";
import "../elements/ScoreElement";
import { Gender } from "../types/Gender";
import { theme } from "../view/theme";

cssRule("bet-overview-page", {
	// Full page
	position: "absolute",
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,

	color: "#f8f8f8",
	fontFamily: "Play, Verdana, Geneva, sans-serif",
	fontSize: "1rem",

	$nest: {

		"& score-el": {
			position: "absolute",
			top: "1em",
			left: "1em",
			right: "1em",
		},

		"& table": {
			borderCollapse: "collapse",
			minHeight: "100%", // did not work on FF, so height used
			height: "100%",
			width: "100%",
		},
		"& .title": {
			height: "8rem",
			color: theme.lightColor,
			opacity: 0.25,
			textAlign: "center",
			margin: "0 auto",
			marginBottom: 0,
			fontFamily: theme.fontFamily,
			fontSize: "6rem",
			fill: theme.lightColor,
			marginTop: "0.4em"
		},
		"& .loading": {
			color: theme.lightColor,
			fontFamily: theme.fontFamily,
			fontSize: "1rem",
			opacity: 0,
			animationDuration: "500ms",
			animationDelay: "1s",
			animationFillMode: "forwards",
			animationName: keyframes({
				"0%": {
					opacity: 0
				},
				"100%": {
					opacity: 1
				}
			})
		},
		"& table .male": {
			backgroundImage: "url('images/bg.png')",

			width: "50%",
			verticalAlign: "top",
			paddingTop: 6,
			backgroundColor: theme.malePrimaryColor,
			textAlign: "center",
			overflow: "hidden",
			$nest: {
				"& icon-el": {
					transformOrigin: "42% 58%",
					animationDuration: "1s",
					animationIterationCount: "infinite",
					animationName: keyframes({
						"0%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
						"50%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(5deg)" },
						"100%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
					})
				}
			}
		},
		"& table .female": {
			backgroundImage: "url('images/bg.png')",

			width: "50%",
			verticalAlign: "top",
			paddingTop: 6,
			backgroundColor: theme.femalePrimaryColor,
			textAlign: "center",
			overflow: "hidden",
			$nest: {
				"& icon-el": {
					transformOrigin: "50% 36%",
					animationDuration: "5s",
					animationIterationCount: "infinite",
					animationTimingFunction: "ease-in-out",
					animationName: keyframes({
						"0%": { transform: "rotate(-10deg)" },
						"50%": { transform: "rotate(10deg)" },
						"100%": { transform: "rotate(-10deg)" },
					})
				}
			}
		},
		"& .bet-percent-title": {
			fontFamily: theme.fontFamily,
			fontSize: "1rem",
			color: theme.lightTextColor,
		},
		"& .bet-percent-value": {
			fontFamily: theme.fontFamily,
			fontSize: "4rem",
			color: theme.lightTextColor,
			marginBottom: "1rem",
		},
		"& .bet-person": {
			fontSize: "1.5rem",
		},
		"& .bet-title": {
			fontFamily: theme.fontFamily,
			fontSize: "1rem",
			color: theme.lightTextColor,
			paddingTop: "1rem",
		},
		"& .bet-value": {
			fontFamily: theme.fontFamily,
			fontSize: "2.5rem",
			color: theme.lightTextColor,
		},
	}
});

@Component({tag: "bet-overview-page"})
export class BetOverviewPageElement extends HyperElement {

	@Property()
	public myTeamGender?: Gender;

	@Property()
	public myTeamPercent?: string;

	@Property()
	public myTeamProfit?: number;

	@Property()
	public myTeamLoss?: number;

	@Property()
	public myTeamPlayerName?: string;

	@Property()
	public otherTeamPercent?: string;

	@Property()
	public otherTeamProfit?: number;

	@Property()
	public otherTeamLoss?: number;

	@Property()
	public otherTeamPlayerName?: string;

	public render() {

		/*
		const myTeamPlayers = (this.players || [])
			.map(p => hyperHTML.wire(this, `:player-${p.id}`)`
				<player-el name="${p.name}" class="${p.id === this.selectedPlayerId ? "selected" : ""}" onclick=${() => this.selectedPlayerId = p.id}/>
			`);
*/
		const myGender = this.myTeamGender || "male";
		const otherGender = myGender === Gender.Male ? Gender.Female : Gender.Male;

		const isLoading = !this.myTeamGender;

		const loadingEl = () => isLoading ? hyperHTML.wire()`<span class="loading">Loading...</span>` : undefined;

		return this.html`
			<score-el></score-el>
			<table><tr>
				<td class="${myGender}">
					<div class="title"><icon-el name="male"/></div>
					<div>${loadingEl()}</div>
					<div>
						<div class="bet-percent-value">${this.myTeamPercent || "?"}%</div>
						<div class="bet-person">${this.myTeamPlayerName || ""}</div>
						<div class="bet-title">speelt voor:</div>
						<div class="bet-value">${(this.myTeamProfit || 0) + (this.otherTeamLoss || 0)}p</div>
					</div>
				</td>
				<td class="${otherGender}">
					<div class="title"><icon-el name="female"/></div>
					<div>${loadingEl()}</div>
					<div>
						<div class="bet-percent-value">${this.otherTeamPercent || "?"}%</div>
						<div class="bet-person">${this.otherTeamPlayerName || ""}</div>
						<div class="bet-title">speelt voor:</div>
						<div class="bet-value">${(this.otherTeamProfit || 0) + (this.myTeamLoss || 0)}p</div>
					</div>
				</td>
			</tr></table>`;
	}
}