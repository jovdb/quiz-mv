import { cssRule } from "typestyle/lib";
import { Component, HyperElement, Property } from "../elements/HyperElement";
import "../elements/ScoreElement";
import { theme } from "../view/theme";

cssRule("bet-wait-page", {

	$nest: {

		"& player-el.selected > button": {
			backgroundColor: "orange",
			color: theme.lightTextColor,
		},
	}
});

@Component({tag: "bet-wait-page"})
export class BetWaitPageElement extends HyperElement {

	@Property()
	public players?: ReadonlyArray<IReadonlyPlayer>;

	@Property()
	public playerIds?: ReadonlyArray<UserId>;

	public render() {
		return this.html`
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<p class="wait-title">Wachten op inzet van andere spelers...</p>
				<div>
				${
					this.players
					? this.players.length > 0
						? this.players.map(p => hyperHTML.wire(this, `:player-${p.id}`)`
							<player-el name="${p.name}" class="${this.playerIds && this.playerIds.some(pid => p.id === pid) ? "selected" : ""}" />
						`)
						: "Geen spelers."
					: "Loading..."
				}
				</div>
			</div>
		</gender-bg-el>
		`;
	}
}