/**
 * Force a compile time error when fail canbe reached (usefull for exhaustive switch/if)
 * @param x type that should not be reached* @param x
 * @param dontThrow optional Usefull when you want to handle all cases of a subset of a type but don't want to throw at runtime
 */
export function exhaustiveFail(x: never, dontThrow: true): void;
export function exhaustiveFail(x: never): never;
export function exhaustiveFail(x: never, dontThrow = false): void | never {
	if (!(dontThrow)) throw new Error(`Unexpected object: ${x}`);
}


export function assert<T>(value: null | undefined, message?: string): never;
export function assert<T>(value: T | null | undefined, message?: string): T;
export function assert<T>(value: T, message?: string): T {
	if (value === null || value === undefined) throw new Error(message || "Value required");
	return value;
}

export function subscribeToEvent<K extends keyof WindowEventMap>(window: Window, type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void;
export function subscribeToEvent<TElement extends HTMLElement, K extends keyof HTMLElementEventMap>(element: TElement, type: K, listener: (this: TElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void;
export function subscribeToEvent(element: HTMLElement, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
export function subscribeToEvent(element: HTMLElement | Window, type: string, listener: any, options?: boolean | AddEventListenerOptions): () => void {

	const cpFn = listener.bind(element); // Copy function so multiple subscriptions are unsubscribed in balance

	// Subscribe
	element.addEventListener(type, cpFn, options);

	// return unsubscribe
	return function unsubscribeFromEvent() {
		element.removeEventListener(type, cpFn, options);
	};
}

//const eventBox = box("Event", "yellow");

/** Patch subscribeToEvent for logging */
/* Because some events are registred by hyperHtml internals, I didn't create a logEvent
export function logEvent<TSubscribe extends typeof subscribeToEvent>(subscribe: TSubscribe) {

	return function _logEvent (target, eventType, fn) {

		// Subscribe
		const oriUnsubscribe = logGroup([eventBox, eventType, box("ON", colors.green)], () => {
			return (subscribe as any)( target, eventType, fn);
		});

		// Unsubscribe
		return function _logEventUnsubscribe() {
			logGroup([eventBox, eventType, box("OFF", colors.red)], () => {
				oriUnsubscribe();
			});
		};
	} as TSubscribe;
}*/

export function combineUnsubscribes(unsubscribes: (() => void)[]) {
	return () => unsubscribes.reverse().forEach(u => u());
}

export async function waitAsync(delayInMs: number): Promise<undefined> {
	return new Promise<undefined>(resolve => setTimeout(() => {
		resolve(undefined);
	}, delayInMs));
}

export function groupBy<T, TKey>(array: ReadonlyArray<T>, groupBy: (item: T) => TKey): Map<TKey, T[]> {
	const map = new Map<TKey, T[]>();
	array.forEach(item => {
		const key = groupBy(item);
		if (!map.has(key)) {
			map.set(key, [item]);
		} else {
			map.get(key)!.push(item);
		}
	});
	return map;
}

export function getRandom<T>(items: ReadonlyArray<T>) {
	return items[Math.floor(Math.random() * items.length)];
}

export function setFocusableChilds(el: HTMLElement, enable: boolean) {

	const selectableElements = ["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"];
	const focusableElements = Array.from(el.querySelectorAll<any>(`${selectableElements.join(",")}, [tabindex]`))
		.filter(el => el.tabIndex >= 0 || (el.tabIndex === 0 && selectableElements.indexOf(el.tagName) > -1));

	focusableElements.forEach(el => {
		if (enable) {
			if (el.oriTagIndex === undefined) return; // nothing to restore
			el.tabIndex = el.oriTabIndex; // can set to 0 when default is 0
			delete el.oriTabIndex;
		} else {
			if (el.oriTagIndex !== undefined) return; // already something to restore, don't override
			el.oriTabIndex = el.tabIndex;
			el.tabIndex = -1; // disable
		}
	});
}