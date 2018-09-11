declare global {
	interface TypeOf<T extends string> {
		[name: string]: T;
	}
}

export let _: undefined;