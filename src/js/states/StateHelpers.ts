import "../types/LoadStateAndValue";

/*
type PropertyNamesOfType<T, TProp> = Exclude<{
	[K in keyof T]: T[K] extends TProp ? K : never;
}[keyof T], undefined>;
*/

// type PropertiesOfType<T, TProp> = Pick<T, PropertyNamesOfType<T, TProp>>;


//type ChangedMessageOfType<T> = Extract<AllowedMessages, ChangedMessage<AllowedMessageNames, Readonly<T> | undefined>>["name"];
//type AsyncChangedMessageOfType<T> = Extract<AllowedMessages, AsyncChangedMessage<AllowedMessageNames, Readonly<T> | undefined>>["name"];


/** Change a property and broadcast a message */
/*
export function changeValue<
	T,
	TPropName extends PropertyNamesOfType<IState, T | undefined>,
	TMessage extends ChangedMessageOfType<NonNullable<IState[TPropName]>>
>(state: IState, newValue: IState[TPropName], propertyName: TPropName, messageName: TMessage) {

	if (!state[propertyName]) (state as any)[propertyName] = {};
	const prevValue = state[propertyName]!;

	// Is Changed
	if (prevValue === newValue) return;

	// Set
	if (!newValue) {
		delete state[propertyName];
		//state[propertyName] = newValue;
	} else {
		state[propertyName] = newValue;
	}

	// Broadcsat change
	const message: ChangedMessage<AllowedMessageNames, T> = {
		name: messageName,
		previous: prevValue,
		current: newValue,
	} as any;

	broadcaster.publish(message as any);
}*/

/** Returns a function to change the state and broadcast a message */
/*export function createValueChanger<
	TPropName extends PropertyNamesOfType<IState,
	any | undefined>>(state: IState, propertyName: TPropName, messageName: ChangedMessageOfType<NonNullable<IState[TPropName]>
>) {
	return (newValue: IState[TPropName]) => {
		changeValue(state, newValue, propertyName, messageName);
	};
}*/


/** Change state and broadcast a message */
/*
export function changeAsyncValue<
	T,
	TPropName extends PropertyNamesOfType<IState, LoadStateAndValue<any> | undefined>,
	TMessage extends AsyncChangedMessageOfType<NonNullable<IState[TPropName]>["value"]>
>(state: IState, newValue: IState[TPropName], propertyName: TPropName, messageName: TMessage) {

	if (!state[propertyName]) updateState(`start of async update: ${messageName}`, state => (state as any)[propertyName] = {});
	const prev = state[propertyName]!;

	const prevValue = prev.value;
	const prevState = prev.state;

	// Is Changed
	if (newValue && prevValue === newValue.value && prevState === newValue.state) return;

	// Set
	if (!newValue) {
		updateState(`remove value for async update: ${messageName}`, state => delete state[propertyName]);
		//state[propertyName] = newValue;
	} else {
		updateState(`update value for async update: ${messageName}`, () => {
			prev.value = (newValue.state === LoadState.Loaded) ? newValue.value as any : undefined;
			prev.state = newValue.state;
		});
	}

	// Broadcsat change
	const message: AsyncChangedMessage<AllowedMessageNames, T> = {
		name: messageName,
		previous: {
			value: prevValue,
			state: prevState
		},
		current: newValue,
	} as any;

	broadcaster.publish(message as any);
}
*/

/** Returns a function to change the state and broadcast a message */
/*export function createAsyncValueChanger<
	TPropName extends PropertyNamesOfType<IState,
	LoadStateAndValue<any> | undefined>>(state: IState, propertyName: TPropName, messageName: AsyncChangedMessageOfType<NonNullable<IState[TPropName]>["value"]
>) {
	return (newValue: IState[TPropName]) => {
		changeAsyncValue(state, newValue, propertyName, messageName);
	};
}
*/

/** Execute a promise and update state (value and load state) */
export async function executePromiseWithLoadState<T>(exec: () => Promise<T>, update: (value: LoadStateAndValue<T>)  => void ): Promise<T> {

	update({state: LoadState.Loading, value: undefined});

	return exec()
		.then(value => {
			update({state: LoadState.Loaded, value});
			return value;
		})
		.catch(() => {
			update({state: LoadState.Error, value: undefined});
			// rethrow arg?
		}) as Promise<T>;
}

export type LazyPromise<T> = () => Promise<T>;

export function assignToLoadStateAndValue<TPromise extends LazyPromise<T>, T>(update: (loadStateAndValue: LoadStateAndValue<T>) => void, fn: TPromise): TPromise {

	return function assignToLoadStateAndValueWrapper() {

		// Start
		update({state: LoadState.Loading, value: undefined});

		return fn()
			.then(value => {

				// End
				update({state: LoadState.Loaded, value});

				return value;
			})
			.catch(err => {

				// Error
				update({state: LoadState.Error, value: undefined});

				throw err;
			});

	} as any as TPromise;

}
