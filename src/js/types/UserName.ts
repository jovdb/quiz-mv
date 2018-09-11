declare global {
	export type UserName = string & TypeOf<"UserName">;
}

export namespace UserName {
	export function validate(userName: string | null | undefined): string {
		if (typeof userName !== "string") return "User name must be a string.";
		if (userName.length > 10) return "User name can be maximum 10 characters long";
		if (userName.length < 1) return "User name is required.";
		return "";
	}

	export function isValid(userName: "" | null | undefined): false;
	export function isValid(userName: string | null | undefined): userName is UserName;
	export function isValid(userName: string | null | undefined): userName is UserName {
		return !validate(userName);
	}

	export function ensure(userName: "" | null | undefined): never;
	export function ensure(userName: string): UserName;
	export function ensure(userName: string | null | undefined, dontThrow: false): UserName;
	export function ensure(userName: string | null | undefined, dontThrow: true): UserName | undefined;
	export function ensure(userName: string | null | undefined, dontThrow = false): UserName | undefined {
		const errorMessage = validate(userName);
		if (errorMessage) {
			if (dontThrow) return undefined;
			throw new Error(errorMessage);
		}
		return userName as UserName;
	}
}