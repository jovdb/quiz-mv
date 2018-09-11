export enum Gender {
	Male = "male",
	Female = "female"
}

export namespace GenderHelper {
	export function ensure(gender: string): Gender {
		return gender === "female" ? Gender.Female : Gender.Male;
	}

	export function validate(gender: "" | null | undefined): never;
	export function validate(gender: string | null | undefined): string;
	export function validate(gender?: string | null | undefined): string {
		if (gender !== Gender.Male && gender !== Gender.Female) return `Invalid gender value: '${gender}'`;
		return "";
	}

	export function isValid(gender: "" | null | undefined): false;
	export function isValid(gender: string | null | undefined): gender is Gender;
	export function isValid(gender?: string | null | undefined): gender is Gender {
		return !validate(gender);
	}
}
