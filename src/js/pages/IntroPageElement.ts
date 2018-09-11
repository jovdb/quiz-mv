import { Component, HyperElement } from "../elements/HyperElement";

@Component({tag: "intro-page"})
export class IntroPageElement extends HyperElement {

	public render() {
		return this.html`
		<gender-bg-el>
		<div class="page">
			<h1>Het Spel:</h1>
			<ul>
				<li>--Under Construction--</li>
				<li>Mannen vs Vrouwen</li>
				<li>Eén man en één vrouw zullen het tegen elkaar moeten opnemen om een opdracht het beste uit te voeren.</li>
				<li>Voor de opdracht kiest iedereen individueel <a href='#speler' title="Speler">wie</a> hij/zij vindt dat de opdracht het beste kan uitvoeren en voor hoeveel <strong><a href='#punten' title="Punten">punten</a></strong>.</li>
				<li>De meeste opdrachten zijn <strong>doe-opdrachten</strong>, dus GSM is enkel voor inzetten en spel overzicht nodig.</li>
				<li>Op het einde weten we <strong>eindelijk</strong> welk geslacht het sterkste is.</li>
			</ul>

			<h1 id="speler">De Speler:</h1>
			<ul>
				<li><strong>Wie het meeste gekozen is</strong> binnen het team moet de opdracht uitvoeren, bij gelijke stand kiest de app.</li>
				<li>Iemand die gekozen is kan voor de volgende vragen niet meer gekozen worden tot iedereen een opdracht heeft uitgevoerd.</li>
			</ul>

			<!--
			<h1 id="punten">De Punten:</h1>
			<ul>
				<li>Beide team starten met 1000 punten.</li>
				<li>Inzetten gebeurd aan de hand van een percentage: 5%, 10% of 15%.</li>
				<li>Het <strong>gemiddelde</strong> percentage van het team wordt gebruikt.</li>
				<li>Wanneer je <strong>wint steel</strong> je dit percentage van de punten van het andere geslacht.</li>
				<li>Wanneer je <strong>verliest</strong> moet je dit percentage van je eigen punten <strong>afgeven</strong>.</li>
			</ul>
			<h1 id="puntenvoorbeeld">Punten Voorbeeld:</h1>
			<ul>
				<li>Score: Mannen: 500, Vrouwen: 1500</li>
				<li>Inzet: Mannen: 10%, Vrouwen: 5%</li>
				<li>Als de <strong>mannen winnen</strong> stelen ze 10% van de vrouwen (10% van 1500 = 150) en verliezen de vrouwen 5% van hun score (5% van 1500 = 75): Totaal = 225p</li>
				<li>Als de <strong>vrouwen winnen</strong> stelen ze 5% van de mannen (5% van 500 = 25) en verliezen de mannen 10% van hun score (10% van 500 = 50): Totaal = 75p</li>
				<li><u>Opmerking</u>: Door met percentages te werken is het makkelijker voor het verliezende team om achterstand weg te werken.</li>
			</ul>
			-->
		</div>
		</gender-bg-el>`;
	}
}