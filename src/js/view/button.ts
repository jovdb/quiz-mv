import { NestedCSSProperties } from "typestyle/lib/types";
import { theme } from "./theme";

const transitionDuration = "200ms";

export function focusStyle() {
	const props: NestedCSSProperties = {
		$nest: {
			"&:focus": {
				outline: "none",
				borderColor: "orange",
			},
		}
	};
	return props;
}

export function clickableStyle(): NestedCSSProperties {

	const focus = focusStyle();
	const props: NestedCSSProperties = {
		...focus,
		transitionDuration,
		transitionProperty: "transform",
		cursor: "pointer",

		$nest: {
			...focus.$nest,
			"&:active": {
				transform: "scale(0.9)",
			},

		}
	};
	return props;
}

export function buttonStyle(): NestedCSSProperties {

	const clickable = clickableStyle();

	const props: NestedCSSProperties = {
		...clickable,
		fontFamily: theme.fontFamily,
		fontSize: "1rem",
		color: theme.lightColor,
		backgroundColor: theme.greyColor,
		border: "0.1rem solid rgba(0, 0, 0, 0.2)",
		padding: "0.5rem 1rem",
		borderRadius: "0.25rem",

		$nest: {
			...clickable.$nest,

			"&:disabled": {
				backgroundColor: `${theme.lightGreyColor} !important`,
			}
		}
	};
	return props;
}

