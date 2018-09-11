import { autorun, configure, observable as obs, onBecomeObserved, onBecomeUnobserved, runInAction } from "mobx";
import { getId } from "../id";
import { box, colors, log, logGroup } from "../logger";

declare global {

	/*
		//https://stackoverflow.com/questions/52064027/how-can-i-write-a-recursive-nonnullable-type-in-typescript
		type RecursiveReadonly1<T> = { [K in keyof T]: RecursiveReadonly<T[K]> };
		type RecursiveReadonly<T> = RecursiveReadonly1<Readonly<T>>;

		type Mutable<T> = { -readonly [P in keyof T]: T[P] } ;
		type RecursiveMutable1<T> = { [K in keyof T]: RecursiveMutable<T[K]> };
		type RecursiveMutable<T> = RecursiveMutable1<Mutable<T>>;
	*/

	type PropertyName<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
	type ObservableState<T> = Readonly<T>; // TODO: RecursiveReadonly
	type MutableState<TState> = TState extends ObservableState<infer T> ? T : never;
}

configure({
	//	enforceActions: "observed", // don't allow state modifications outside actions
	//	reactionScheduler: f => setTimeout(f, Math.random() * 10000),
});

export let logMobX = true;
const mobXBox = box("MobX");

/**
 * Make object observable and readonly
 * You must change the state with the changeState command
 */
export const observableState: <T>(obj: T) => ObservableState<T> = obs;

/** Hold reference with items that will be rerun */
export const activeSubscriptions = {};

export function reRunOnStateChange(fn: () => void, name?: string) {
	const logName = name || fn.name;
	if (!logName) throw new Error("reRun requires a function with a name");

	if (!logMobX) return autorun(fn);

	let isFirst = true;
	const id = getId();
	const idBox = box(`#${id}`, colors.lightGrey);
	activeSubscriptions[`_${id}`] = logName;

	const unsubscribe = autorun(() => {
		logGroup([mobXBox, box("reRun", colors.orange), idBox, isFirst ? box("ON", colors.green) : "", logName], () => {
			isFirst = false;
			fn();
		});
	}, { name });

	return () => {
		log(mobXBox, box("reRun", colors.orange), idBox, box("OFF", colors.red), logName);
		delete activeSubscriptions[`_${id}`];
		unsubscribe();
	};
}


/** By using this function you have a mutable State */
export function changeState <TState extends ObservableState<T>, TResult, T>(state: TState, description: string, change: (state: MutableState<TState>) => TResult): TResult {

	if (!logMobX) return runInAction(description, () => change(state as any));

	// I think we can use a group because reactions are executed immediate synchronous.
	return logGroup([mobXBox, box("changeState"), description], () => {
		return runInAction(description, () => change(state as any));
	});
}

/** When a property is watched, start the passed function and execute the unsubscribe function when stopped watching */
export function whenStatePropUsed<TState>(state: TState, description: string, propName: PropertyName<TState>, onSubscribe: () => () => void ) {

	let cleanup: (() => void ) | undefined;
	const idBox = box(`#${getId()}`, colors.lightGrey);
	let disposables = [
		onBecomeObserved(state, propName, function _whenStatePropUsedStart() {
			if (logMobX) log(mobXBox, box("whenStatePropUsed", colors.orange), idBox, box("ON", colors.green), description);
			const unsubscribe = onSubscribe();
			return cleanup = function _whenStatePropUsedDispose() {
				if (logMobX) log(mobXBox, box("whenStatePropUsed", colors.orange), idBox, box("OFF", colors.red), description);
				unsubscribe();
			};
		}),

		// IDEA: Track use count and optionally dispose with a delay()?
		onBecomeUnobserved(state, propName, function _whenStatePropUsedEnd() {
			cleanup!();
		}),
	];

	return () => {
		disposables.forEach(d => d());
		cleanup = undefined;
		disposables = [];
	};
}
