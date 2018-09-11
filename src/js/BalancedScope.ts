
declare global {
	export interface BalancedScopeOptions<TStartResult> {
		onStart(): TStartResult;
		onEnd(value: TStartResult): void;

		/** Called every time when already started */
		onJoin?(): void;
	}

	export interface IReadonlyBalancedScope {
		isBusy(): boolean;
	}

	export interface IBalancedScope extends IReadonlyBalancedScope {
		start(): () => void;
		during<TPromise extends Promise<any>>(promise: TPromise): TPromise;
	}
}

export class BalancedScope<TStartResult = void> implements IBalancedScope {

	private startCount: number;
	private readonly onStart: () => TStartResult;
	private readonly onEnd: (value: TStartResult) => void;
	private readonly onJoin: (() => void) | undefined;
	private onStartResult: TStartResult | undefined;
	private isStopped: boolean;

	constructor(options: BalancedScopeOptions<TStartResult>) {
		this.startCount = 0;
		this.onStart = options.onStart;
		this.onEnd = options.onEnd;
		this.onJoin = options.onJoin;
		this.isStopped = false;
	}

	/** The returned function should be called to end */
	public start(): () => void {
		if (this.isStopped) return () => undefined;
		let hasEdded = false;
		this.startCount++;
		if (this.startCount === 1) {
			this.onStartResult = this.onStart();
		} else {
			if (this.onJoin) this.onJoin();
		}

		return () => {
			if (!hasEdded) { // Execute only once
				hasEdded = true;
				this.end();
			}
		};
	}

	/** Try to use the returned function from start */
	public end() {
		if (this.isStopped) return;
		this.startCount--;
		if (this.startCount === 0) this.onEnd(this.onStartResult!);
	}

	/** When you want to dispose, you can force it to end */
	public stop() {
		while (this.startCount > 0) {
			this.end();
		}
		this.isStopped = true;
	}

	public isBusy(): boolean {
		return this.startCount > 0;
	}

	public during<TPromise extends Promise<any>>(promise: TPromise): TPromise {
		this.start();
		return promise.then(results => {
			this.end();
			return results;
		}).catch(err => {
			this.end();
			throw err;
		}) as TPromise;

	}
}