import { box, colors, log } from "./logger";

/*
╭────────────────────────────────╮
│ Broadcaster                    │
├────────────────────────────────┤
│ subscribe()                    │
│ publish()                      │
╰────────────────────────────────╯

TODO:
- Detect recursion


// Remark: Don't broadcast messages while previous message is not yet handled by all listeners

Example of broadcast tree:
A
├─B
│ ├─C
│ └─D
└─E
  └─F

Broadcasted   Queue           Info
-----------   -----           ----
A:            B, E            listeners of A wants to broadcast B, E -> Queue
B:               E, C, D      listeners of B wants to broadcast C, D -> Queue
E:                  C, D, F   listeners of E wants to broadcast F -> Queue
C:                     D, F
D:                        F
F

Result: First level one is broadcasted, then child levels are broadcasted
*/

declare global {

	type BroadcasterListener<TMessage extends Message = Message> = (message: TMessage) => void ;

	interface IReadonlyBroadcaster<TMessage extends Message = Message> {
		subscribe(onMessage: BroadcasterListener<TMessage>): () => void ;
	}

	interface IBroadcaster<TMessage extends Message = Message> extends IReadonlyBroadcaster<TMessage> {
		publish(message: TMessage): TMessage;
	}

	interface Message<TName extends string = AllowedMessageNames> {
		readonly name: TName;
	}

	// Build maps of known messages */
	type MessageMap<T extends string> = {
		[P in T]: Message<P>;
	};

	/** Should be augmented with new Messages */
	interface AllowedMessagesMap extends MessageMap<keyof AllowedMessagesMap> {}
	type AllowedMessageNames = keyof AllowedMessagesMap;
	type AllowedMessages = AllowedMessagesMap[AllowedMessageNames];

	//@ts-ignore
	type FilterMessageOnProp<TPropName extends string, TMap extends AllowedMessagesMap = AllowedMessagesMap> = TMap[{
		[TName in keyof TMap]: keyof TMap[TName] & TPropName & TMap[TName]; // & TPropName
	}[keyof { // X[keyof X] // trick to remove never props from Type
		[TName in keyof TMap]: keyof TMap[TName] & TPropName & TMap[TName];
	}]["name"]];

}

export function isMessage<TName extends AllowedMessageNames>(message: AllowedMessages, name: TName): message is AllowedMessagesMap[TName];
export function isMessage(message: AllowedMessages, name?: string): message is AllowedMessages;
export function isMessage(message: AllowedMessages, name?: string): message is AllowedMessages {
	return message && name ? message.name === name : true;
}

export class Broadcaster implements IBroadcaster {
	private listeners: BroadcasterListener<AllowedMessages>[];
	private publishQueue: AllowedMessages[];
	private isPublishing: boolean;
	private retainedMessages: {[messageName: string]: any};

	constructor() {
		this.listeners = [];
		this.publishQueue = [];
		this.isPublishing = false;
		this.retainedMessages = {};
	}

	/** Get notificaions of executed (root) commands */
	public subscribe(onMessage: BroadcasterListener<AllowedMessages>): () => void {
		const copiedFunction = onMessage.bind(undefined);
		this.listeners.push(copiedFunction);

		// Return unsubscribe method
		return () => {
			const index = this.listeners.indexOf(copiedFunction);
			if (index >= 0) this.listeners.splice(index, 1);
		};
	}

	/** Get notificaions of executed (root) commands */
	public subscribeOnMessage<TMessageName extends AllowedMessageNames>(messageName: TMessageName, onMessage: BroadcasterListener<AllowedMessagesMap[TMessageName]>): () => void {

		// Publish retained message if available
		const retainedMessage = this.getRetainedMessage(messageName);
		if (retainedMessage) {
			Promise.resolve().then(() => { // Start microtask
				onMessage(retainedMessage!); // Don't publish, only send to this listener
			});
		}

		function subscribeOnMessageFilter(message: AllowedMessages) {
			if (message.name === messageName) onMessage(message);
		}
		this.listeners.push(subscribeOnMessageFilter);

		// Return unsubscribe method
		return () => {
			const index = this.listeners.indexOf(subscribeOnMessageFilter);
			if (index >= 0) this.listeners.splice(index, 1);
		};

	}


	/** Get last retained message
	 * Because you should know if retained messages are stored, it is better to use subscribeOnMessage
	 */
	public getRetainedMessage(messageName: AllowedMessageNames): FilterMessageOnProp<"shouldRetain"> | undefined {
		return this.retainedMessages[messageName];
	}

	private shouldRetainMessage(message: AllowedMessages): boolean {
		return !!(message && (message as any).shouldRetain);
	}

	/** Subsribe to a message until the done callback is called */
	public async subscribeUntilAsync<TResult>(onMessage: (message: AllowedMessages, done: (result?: TResult, err?: any) => void ) => void ): Promise<TResult> {
		return new Promise<TResult>((resolve, reject) => {
			const unsubscribe = this.subscribe(message => {
				onMessage(message, end);
			});
			function end(result?: TResult, err?: any) {
				if (unsubscribe) unsubscribe();
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}
		});
	}


	/** Broadcast async to prevent listeners publishing new messages before all lsiters complete handling the first message */
	public publish<T extends AllowedMessages>(message: T): T {

		// Add to Queue (prevent publishing while previous message is not yet handled by all listeners)
		if (this.isPublishing) {
			this.publishQueue.push(message);
			return message;
		}

		// Retain Message? https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages
		// Retained messages are messages that should keep the last values
		if (this.shouldRetainMessage(message)) {
			this.retainedMessages[message.name] = message;
		}

		try {
			this.isPublishing = true;
			//console.log(`publish message: ${message.name}`, JSON.stringify(message)); // stringyfy so it can be copy/pasted for republis"
			log(box(message.name, colors.orange), "broadcasted");
			// First copy so unsubscribers don't manipulate the list iterating
			this.listeners.slice(0).forEach(listener => { listener(message as any); });
		} finally {
			this.isPublishing = false;
		}

		// Handle queue recursive(broadcast nested messages)
		if (this.publishQueue.length > 0) {
			const nextMessage = this.publishQueue.shift();
			if (nextMessage) {
				this.publish(nextMessage);
			}
		}

		return message;

	}

	// /**
	//  * Resolve this promise when we receive the response (success or fail) of a request
	//  */
	// public async waitForResponseAsync<TRequestMessage extends RequestMessage, TResponseMessage extends ResponseMessage<TRequestMessage>>(request: TRequestMessage): Promise<TResponse> {
	// 	return new Promise<TResponse>((resolve) => {
	// 		const unsubscribe = this.subscribe(message => {
	// 			if (isResponse(message, request.name)) {
	// 				unsubscribe();
	// 				resolve(message as any as TResponse);
	// 			}
	// 		});
	// 	});
	// }

	// /**
	//  * Promise that will resove with the response result or fail with the response error
	//  */
	// public async responseAsAsync<TRequest extends RequestMessage, TResult extends {}>(request: TRequest): Promise<TResult> {
	// 	return new Promise<TResult>((resolve, reject) => {
	// 		const unsubscribe = this.subscribe(message => {
	// 			if (isResponse(message, request.name)) {
	// 				unsubscribe();
	// 				if (message.state === ResponseState.Failed) reject((message as any as FailResponse<TRequest>).error);
	// 				resolve((message as any as SuccessResponse<TRequest, TResult>).result);
	// 			}
	// 		});
	// 	});
	// }
}

export const broadcaster = new Broadcaster();
