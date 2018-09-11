import { NestedCSSProperties } from "typestyle/lib/types";

export interface ITheme {
	malePrimaryColor: string;
	femalePrimaryColor: string;
	selectionColor: string;
	lightColor: string;
	greyColor: string;
	lightGreyColor: string;
	darkTextColor: string;
	lightTextColor: string;
	fontFamily: string;
	fontSize: number;
	boxShadow: string;
}

export const theme: ITheme = {
	malePrimaryColor: "#4580ff",
	femalePrimaryColor: "#ea88db",
	selectionColor: "orange",
	lightColor: "#ffffff",
	greyColor: "#888888",
	lightGreyColor: "#AAAAAA",
	darkTextColor: "#333333",
	lightTextColor: "#f8f8f8",
	fontFamily: "Play, Verdana, Geneva, sans-serif",
	fontSize: 16,
	boxShadow: "0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
};

export namespace HexColor {
	export function toString(r: number, g: number, b: number) {
		const newR = r.toString(16);
		const newG = g.toString(16);
		const newB = b.toString(16);
		return `#${newR.length < 2 ? `0${newR}` : newR}${newG.length < 2 ? `0${newG}` : newG}${newB.length < 2 ? `0${newB}` : newB}`;
	}

	export function parse(hexColor: string) {
		if (hexColor.length !== 7) throw new Error("Invalid hex color must be 7 chars long.");
		if (hexColor[0] !== "#") throw new Error("Hex color should start with '#'");
		const r = parseInt(hexColor[1] + hexColor[2], 16);
		const g = parseInt(hexColor[3] + hexColor[4], 16);
		const b = parseInt(hexColor[5] + hexColor[6], 16);
		return {r, g, b};
	}

	export function mix(hexColor1: string, hexColor2: string, alpha2: number) {

		const color1 = parse(hexColor1);
		const color2 = parse(hexColor2);

		const alpha1 = 1 - alpha2;

		const alpha = alpha1 + alpha2 * (1 - alpha1);
		const red = color1.r * alpha1 + color2.r * alpha2 * (1 - alpha1) / alpha;
		const green = color1.g * alpha1 + color2.g * alpha2 * (1 - alpha1) / alpha;
		const blue = color1.b * alpha1 + color2.b * alpha2 * (1 - alpha1) / alpha;

		return toString(Math.round(red), Math.round(green), Math.round(blue));
	}

/*
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors#answer-13542669
function shadeRGBColor(hexColor: string, percent: number) {

		const t = percent < 0 ? 0 : 255;
		const p = percent < 0 ? percent * -1 : percent;
		const colorParts = parseHexColor(hexColor);

		const newR = (Math.round((t - colorParts.r) * p) + colorParts.r).toString(16);
		const newG = (Math.round((t - colorParts.g) * p) + colorParts.g).toString(16);
		const newB = (Math.round((t - colorParts.b) * p) + colorParts.b).toString(16);

		//return `rgb(${Math.round((t - R) * p) + R}, ${Math.round((t - G) * p) + G}, ${Math.round((t - B) * p) + B})`;
		return `#${newR.length < 2 ? `0${newR}` : newR}${newG.length < 2 ? `0${newG}` : newG}${newB.length < 2 ? `0${newB}` : newB}`;
}*/

}

export function button(): NestedCSSProperties {
	return {
		$debugName: "button",
		fontFamily: theme.fontFamily,
		fontSize: "1rem",
		minWidth: "5rem",
		backgroundColor: theme.greyColor,
		padding: "0.5rem",
		color: theme.lightColor,
		borderRadius: `${1 / 8}rem`,
		border: "none",
		transition: "transform 0.1s eas-in-out",
		$nest: {
			"&:enabled:hover": {
				boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
				cursor: "pointer"
			},

			"&:enabled:active": {
				boxShadow: "0 0 2px rgba(0,0,0,0.3)",
				transform: "scale(0.95)",
				border: "none"
			},

			"&:disabled": {
				backgroundColor: HexColor.mix(theme.greyColor, theme.lightColor, 0.7)
			}
		}
	};
}
