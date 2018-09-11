import { broadcaster } from "./broadcaster";
import { addPlayers } from "./database/Database";
import { Gender } from "./types/Gender";
import { UserName } from "./types/UserName";
import { Route } from "./view/RouterComponent";


interface ITest {
	description: string;
	run(): void;
	continue?(done: (err?: any) => void, id: number): void;
}

export function onMessage(messageName: keyof AllowedMessagesMap, timeoutInMs = 5000) {

	return (done: (err?: any) => void, id: number) => {
		let unsubscribe: (() => void) | undefined;
		let timerId = setTimeout(() => {
			if (unsubscribe) {
				unsubscribe();
				unsubscribe = undefined;
				timerId = 0;
			}
			done(`Test #${id} timed out. Didn't receive message '${messageName}' in ${timeoutInMs}ms.`);
		}, timeoutInMs);
		unsubscribe = broadcaster.subscribe(message => {
			if (message.name === messageName) {

				if (unsubscribe) {
					unsubscribe();
					unsubscribe = undefined;
				}

				if (timerId) {
					clearTimeout(timerId);
					timerId = 0;
				}
				done();
			}
		});
	};
}

export function runTests(next: () => ITest) {

	const delayInMs = 100;
	let id = 0;
	function runTest() {
		const test = next();
		if (test) {

			id = id + 1;
			const continueFn = test.continue
				? test.continue
				: (done: (err?: any) => void) => done(); // No extra delay

			continueFn((err) => {
				if (err) console.error(err);
				setTimeout(runTest, delayInMs);
			}, id);

			const logMessage = `Start test #${id}: ${test.description}`;
			console.group(logMessage);
			test.run();
			console.groupEnd();
		}
	}

	runTest();
}

export function runDefaultTests() {
	const tests: ITest[] = [
		{
			description: "Add Players",
			run: addPlayers
		},
		{
			description: "Open Fab",
			run: () => actions.toggleFab.exec({shouldOpen: true})
		},
		{
			description: "Open LogOn screen",
			run: () => actions.toggleLogOn.exec({shouldOpen: true})
		},
		{
			description: "Fill LogOn screen",
			run: () => actions.toggleLogOn.exec({shouldOpen: true, userName: "Jo VdB", gender: Gender.Male})
		},
		{
			description: "Log on",
			run: () => actions.logOn.exec({userName: UserName.ensure("Jo VdB"), gender: Gender.Male}),
			continue: onMessage("LogOnUserResponse")
		},
		{
			description: "Change Route",
			run: () => actions.changeRoute.exec({route: Route.Intro}),
		},
		/*
		{
			description: "Open Fab",
			run: () => actions.toggleFab.exec({shouldOpen: true})
		},
		{
			description: "Show LogOff",
			run: () => actions.toggleLogOff.exec({shouldOpen: true }),
		},
		{
			description: "Log off",
			run: () => actions.logOff.exec(),
			continue: onMessage("LogOffUserResponse")
		},*/
	];

	let index = 0;
	runTests(() => tests[index++]);
}