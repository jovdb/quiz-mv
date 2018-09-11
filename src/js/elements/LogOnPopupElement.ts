import { cssRule } from "typestyle/lib";
import { Gender, GenderHelper } from "../types/Gender";
import { UserName } from "../types/UserName";
import { buttonStyle, focusStyle } from "../view/button";
import { theme } from "../view/theme";
import { Component, HyperElement } from "./HyperElement";
import "./IconElement";

declare global {
	interface HTMLElementEventMap extends ElementEventMap {
		"log-on-click": CustomEvent<{}>;
	}
}

cssRule("log-on-popup", {
	$nest: {

		"& input[type='text']": {
			...focusStyle(),
			fontFamily: theme.fontFamily,
			fontSize: "1rem",
			backgroundColor: theme.greyColor,
			color: theme.lightColor,
			border: "0.1rem solid rgba(0, 0, 0, 0.2)",
			padding: "0.5rem",
			borderRadius: "0.25rem",
		},
		"& input[type='text']::placeholder": {
			color: theme.lightColor,
		},
		"& h1": {
			margin: 0,
			marginBottom: "1rem",
			fontWeight: "normal",
		},

		"& input[type='radio']": {
			marginTop: "1rem",
			verticalAlign: "bottom",
			width: "1rem",
			height: "1rem",

			...focusStyle(),


			/*
			position: "absolute",
			opacity: 0, // Hide

			$nest: {
				"&:before": {
					content: "''",
					backgroundColor: "blue",
					borderRadius: "100%",
					border: "1px solid red",
					display: "inline-block",
					width: "1.4em",
					height: "1.4em",
					position: "relative",
					top: "-0.2em",
					marginRight: "1em",
					verticalAlign: "top",
					cursor: "pointer",
					textAlign: "center",
					transition: "all 250ms ease"
				},
				"&:checked + label:before": {
					backgroundColor: "green",
					boxShadow: "inset 0 0 0 4px yellow"
				}
			}*/
		},

		"label[for='male']": {
			marginRight: "2rem",
		},
		"& button": {
			...buttonStyle(),
			marginTop: "2rem",
		},

		"[selected-gender='male']": {
			$nest: {
				"& input[type='text'], & button": {
					backgroundColor: theme.malePrimaryColor,
				},
				"&": {
					//color: HexColor.mix(theme.malePrimaryColor, theme.darkTextColor, 0.3)
				}
			}
		},
		"[selected-gender='female']": {
			$nest: {
				"& input[type='text'], & button": {
					backgroundColor: theme.femalePrimaryColor,
				},
				"&": {
					//color: HexColor.mix(theme.femalePrimaryColor, theme.darkTextColor, 0.3)
				}
			}
		},
	}
});

@ Component({tag: "log-on-popup"})
export class LogOnPopupElement extends HyperElement {

	constructor() {
		super();

		// bind methods to this
		this.logOnButtonClicked = this.logOnButtonClicked.bind(this);
		this.userNameChanged = this.userNameChanged.bind(this);
		this.genderChanged = this.genderChanged.bind(this);
	}

	public get userName(): UserName | undefined {
		const nameEl = this.querySelector<HTMLInputElement>("input[name='name']");
		return (nameEl && UserName.isValid(nameEl.value)) ? UserName.ensure(nameEl.value) : undefined;
	}

	public get gender(): Gender | undefined {
		const node = Array.from(this.querySelectorAll<HTMLInputElement>("input[name='gender']")).find(node => node.checked);
		return node
			? GenderHelper.ensure(node.value)
			: undefined;
	}

	protected logOnButtonClicked(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();

		// Validate
		const event: HTMLElementEventMap["log-on-click"] = new CustomEvent<{}>("log-on-click", {
			detail: {},
			bubbles: false
		});
		this.dispatchEvent(event);
	}

	private canSubmit() {
		return !!(this.userName && this.gender);
	}

	protected userNameChanged(e: Event) {
		e.stopPropagation();
		this.invalidate();
	}

	protected genderChanged(e: Event) {
		e.stopPropagation();
		this.invalidate();
	}

	public render() {
		return this.html`<top-popup selected-gender="${this.gender}">
			<form>
				<h1>Speel mee!</h1>
				<input type="text" name="name" placeholder="Naam" maxlength="10" required="required" oninput="${this.userNameChanged}" autocomplete="off"/><br/>
				<div>
					<input id="male" type="radio" name="gender" value="male" onchange="${this.genderChanged}"/>
					<label for="male"><icon-el name="male"/> Man</label>
					<input id="female" type="radio" name="gender" value="female" onchange="${this.genderChanged}"/>
					<label for ="female"><icon-el name="female"/> Vrouw</label>
				</div>
				<button onclick="${this.logOnButtonClicked}" type="submit" disabled="${!this.canSubmit()}">Join</button>
			</form>
		</top-popup>`;
	}
}