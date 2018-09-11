import { cssRule, keyframes } from "typestyle/lib";
import { Component, HyperElement, Property } from "../elements/HyperElement";
import "../elements/PlayerElement";
import { Gender } from "../types/Gender";
import { theme } from "../view/theme";

cssRule("players-page", {

	// Full page
	position: "absolute",
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,

	$nest: {
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
		},
		"& .vs": {
			position: "absolute",
			top: "2.8rem",
			left: "50%",
			color: theme.lightColor,
			opacity: 0.25,
			fontFamily: `Condiment, ${theme.fontFamily}`,
			fontSize: "3rem",
			fontWeight: "bold",
			animationDuration: "3s",
			animationIterationCount: "infinite",
			animationTimingFunction: "ease-in-out",
			animationName: keyframes({
				"0%": { transform: "translateX(-50%) scale(1)" },
				"1%": { transform: "translateX(-50%) scale(1.3) skewX(-8deg)" },
				"3%": { transform: "translateX(-50%) scale(1) skewX(-1deg)" },
				"10%": { transform: "translateX(-50%) scale(1) skewX(1deg)" },
				"11%": { transform: "translateX(-50%) scale(1.2) skewY(5deg)" },
				"13%": { transform: "translateX(-50%) scale(1)" },
				"100%": { transform: "translateX(-50%) scale(1)" },
			})
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
		"& .male": {
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
		"& .female": {
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
		}
	}
});

@Component({tag: "players-page"})
export class PlayersPageElement extends HyperElement {

	@Property()
	public players?: ReadonlyArray<Readonly<IPlayer>>;

	@Property()
	public loggedOnUser?: Readonly<IPlayer>;

	@Property()
	public isLoading?: boolean;

	public render() {

		const players = this.players ? this.players.slice(0) : [];
		players.sort((a, b) => a.name > b.name ? 1 : -1);

		const maleEls = players
			.filter(p => p.gender === Gender.Male && p.isOnline())
			.map(p => hyperHTML.wire(this, `:player-${p.id}`)`
				<player-el name="${p.name}" isMe="${!!this.loggedOnUser && (this.loggedOnUser.id === p.id)}"/>
			`);

		const femaleEls = players
			.filter(p => p.gender === Gender.Female && p.isOnline())
			.map(p => hyperHTML.wire(this, `:player-${p.id}`)`
				<player-el name="${p.name}" isMe="${!!this.loggedOnUser && (this.loggedOnUser.id === p.id)}"/>
			`);

		const loadingEl = () => this.isLoading ? hyperHTML.wire()`<span class="loading">Loading...</span>` : undefined;

		return this.html`
			<table><tr>
				<td class="male">
					<div class="title"><icon-el name="male"/></div>
					<div>${loadingEl() || maleEls}</div>
				</td>
				<td class="female">
					<div class="title"><icon-el name="female"/></div>
					<div>${loadingEl() || femaleEls}</div>
				</td>
			</tr></table>
			<div class="vs">VS</div>
		`;
	}
}