import { cssRule } from "typestyle/lib";
import { Gender } from "../types/Gender";
import { theme } from "../view/theme";
import { Attribute, Component, HyperElement } from "./HyperElement";

cssRule("gender-bg-el", {

	position: "absolute",
	width: "100%",
	minHeight: "100%",
	top: 0,
	left: 0,
	backgroundImage: "url(images/bg.png)",

	$nest: {
		"&[gender='male']": {
			backgroundColor: theme.malePrimaryColor,
		},
		"&[gender='female']": {
			backgroundColor: theme.femalePrimaryColor,
		}
	}
});

@Component({tag: "gender-bg-el"})
export class GenderBackgroundElement extends HyperElement {

	constructor() {
		super();
		this.loadSlots();
	}

	@Attribute()
	public gender?: Gender;

	public render() {
		return this.html`${this.slots.default}`;
	}
}