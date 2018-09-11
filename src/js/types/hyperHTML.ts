declare global {
	namespace hyperHTML {

		/**
		 * Use when you want to populate an element with some content.
		 */
		function bind(el: HTMLElement): Function;

		/**
		 * Use whenever you want to create a container, instead of populating one, or when you want to create some DOM content at runtime,
		 */
		function wire(obj?: Object, typeID?: string): any;
	}

	class HyperHTMLElement<TState extends object = {}> extends HTMLElement {

		public static define(name: string): void;
		public static bind(el: HTMLElement): Function;
		public static wire(obj?: Object, typeID?: string): any;

		public html: Function;
		public state: TState;

		public render (): any;
		public created(): void;
		public setState(state: TState): void;

	}
}
export let _: undefined;