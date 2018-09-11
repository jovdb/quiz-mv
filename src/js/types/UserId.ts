
declare global {
	type UserId = string & TypeOf<"UserId">;
}

export namespace UserId {
	export function validate(userId: string | null | undefined): string {
		if (typeof userId !== "string") return "User id must be a string.";
		if (userId.length > 10) return "User id can be maximum 10 characters long";
		if (userId.length < 1) return "User id is required.";
		return "";
	}

	export function ensure(userId: string): UserId;
	export function ensure(userId: string, dontThrow: false): UserId;
	export function ensure(userId: string, dontThrow: true): UserId | undefined;
	export function ensure(userId: string, dontThrow = false): UserId | undefined {
		const errorMessage = validate(userId);
		if (errorMessage) {
			if (dontThrow) return undefined;
			throw new Error(errorMessage);
		}
		return userId.toLowerCase() as UserId;
	}

	export function isValid(userId: string | null | undefined): boolean {
		return !validate(userId);
	}
}