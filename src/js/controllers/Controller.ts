import { getId } from "../id";
import { box, colors, log, logGroup } from "../logger";

export let logControllers = true;

const controllerBox = box("Controller", colors.purple);
export function logController<TFn extends (...args: any[]) => IDisposable | undefined>(controllerCreator: TFn): TFn {

	if (!logControllers) return controllerCreator;

	return function _logController(...args: any[]) {

		const idBox = box(`#${getId()}`, colors.lightGrey);

		// Log Start
		const result = logGroup([controllerBox, idBox, box("ON", colors.green), controllerCreator.name], function _logControllerCaptureStartGroup() {

			// Call original function
			return controllerCreator(...args);
		});

		// Patch dispose (if available) to log
		if (result) {
			const oriDispose = result.dispose;
			result.dispose = function _logControllerDispose() {

				// Log Dispose
				logGroup([controllerBox, idBox, box("OFF", colors.red), controllerCreator.name], function _logControllerCaptureEndGroup() {
					oriDispose();
				});
			};
		} else {
			log(controllerBox, idBox, box("OFF", colors.red), controllerCreator.name);
		}

		return result;
	} as TFn;

}
