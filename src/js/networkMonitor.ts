import { IDisposable } from "./Disposable";

/** Checks network is currently online */
export function getIsOnline(): boolean {
	return window.navigator.onLine;
}

/** watch for changes in Network status */
export function watchNetworkStatus(cb: (isOnline: boolean, isInitState: boolean) => void): IDisposable {

	// Start with current status
	cb(getIsOnline(), true);

	// Watch offline
	const offLineCallback = () => { cb(false, false); };
	window.addEventListener("offline", offLineCallback);

	// Watch online
	const onLineCallback = () => { cb(true, false); };
	window.addEventListener("online", onLineCallback);

	return {
		dispose() {
			window.removeEventListener("offline", offLineCallback);
			window.removeEventListener("online", onLineCallback);
		}
	};
}