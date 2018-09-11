import { logGroup, box, colors } from "../logger";

export abstract class HyperElement extends HTMLElement {

	/** Indicates a rerender is requested and queued, so we kan skip requests */
	private isRerenderRequested: boolean;
	private unsubscribeConnection: (() => void) | undefined;

	/** Tagged Template Literal function */
	public html: Function;

	/** slot information */
	protected slots: { [slotName: string]: Node[] } & { default: Node[] };

	constructor() {
		super();
		this.isRerenderRequested = false;
		this.unsubscribeConnection = undefined;
		this.html = hyperHTML.bind(this);
		this.slots = {
			default: []
		} as any;
	}

	protected loadSlots() {
		const children = this.childNodes;
		if (children.length > 0) {
			Array.from(children).map(child => {
				const slotName = (child as any).getAttribute ? (child as any).getAttribute("slot") : undefined;
				if (!slotName) {
					this.slots.default.push(child);
				} else {
					if (!this.slots[slotName]) { this.slots[slotName] = []; }
					this.slots[slotName].push(child);
				}
			});
		}
	}

	/** Rerender this Element */
	public abstract render(): any;

	/**
	 * I prefer to expose connectCallback and disconnectCallback with 1 function.
	 * So no member variables need to be stored for use at disconnect when inheriting
	 */
	public onConnect(): (() => void) | undefined {
		return undefined;
	}

	/* Called every time the element is inserted into the DOM */
	//@ts-ignore
	protected connectedCallback(): void {
		this.unsubscribeConnection = this.onConnect();
		this.render();
	}

	/** Called every time the element is removed from the DOM. */
	//@ts-ignore
	protected disconnectedCallback(): void {
		if (this.unsubscribeConnection) {
			this.unsubscribeConnection();
			this.unsubscribeConnection = undefined;
		}
	}

	/** Called when an attribute was added, removed, or updated */
	public attributeChangedCallback(_attrName: string, _oldVal: string, _newVal: string): void {
		return undefined;
	}

	/* Called if the element has been moved into a new document */
	public adoptedCallback() {
		return undefined;
	}

	public dispatchEvent(evt: Event) {
		return logGroup([box("⚡ Event", colors.orange), evt.type], () => {
			return super.dispatchEvent(evt);
		});
	}

	/**
	 * Request an UI update asynchronious.
	 * Multiple requests are batched as one UI update.
	 */
	public invalidate() { // make protected by default?
		if (!this.isRerenderRequested) {
			// All additional invalidate() calls before will be ignored.
			this.isRerenderRequested = true;

			// Schedule the following as micro task, which runs before requestAnimationFrame.
			// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
			// tslint:disable-next-line
			Promise.resolve().then(() => { // Don't use await for tslint rule: no-floating-promises (when function is async all callers must handle it)
				this.isRerenderRequested = false;
				this.render();
			});
		}

	}

	/** Tells the element which attributes to observer for changes */
	public static observedAttributes: string[];
}

/** Custom element decorator */
export function Component(options: {
	tag: string;
}) {
	return function (ctor: any) {
		if (arguments[1]) throw new Error("only use @Component as class decorator");
		customElements.define(options.tag, ctor);
		return ctor;
	};
}


/** Creates a getter and setter that gets/sets the data in an attribute */
export function Attribute(options: {

	/** Name to use as attribute, default the property name */
	attributeName?: string;

	/** The way to store this this attribute, default: string */
	type?: "boolean" | "string" | "number";

} = {}) {
	return function (proto: any, propName: string) {

		if (!propName || typeof proto[propName] === "function") throw new Error("only use @Attribute decorator on member variables");

		const {
			attributeName = propName,
			type = "string",
		} = options;

		// tslint:disable:no-invalid-this

		// Save as string
		if (type === "string") {
			Object.defineProperty(proto, propName, {
				get () {
					return this.getAttribute(attributeName);
				},

				set (newValue) {
					if (newValue !== null && newValue !== undefined) {
						this.setAttribute(attributeName, newValue);
					}
					else {
						this.removeAttribute(attributeName);
					}
				},
				enumerable: true,
				configurable: true
			});
		}

		// Save as number
		else if (type === "number") {
			Object.defineProperty(proto, propName, {
				get () {
					return parseFloat(this.getAttribute(attributeName));
				},

				set (newValue) {
					if (newValue !== null && newValue !== undefined) {
						this.setAttribute(attributeName, newValue.toString());
					}
					else {
						this.removeAttribute(attributeName);
					}
				},
				enumerable: true,
				configurable: true
			});
		}

		// Save as boolean
		else if (type === "boolean") {
			Object.defineProperty(proto, propName, {
				get () {
					return this.hasAttribute(attributeName);
				},

				set (newValue) {
					const currentValue = this.hasAttribute(attributeName); // Check else observedAttributes triggered
					if (newValue) {
						if (!currentValue) this.setAttribute(attributeName, "");
					}
					else {
						if (currentValue) this.removeAttribute(attributeName);
					}
				},
				enumerable: true,
				configurable: true
			});
		} else {
			throw new Error("invalid attribute type");
		}

		// tslint:enable:no-invalid-this
	};
}

/** Rerender when Propery changes */
export function Property() {
	return function (proto: any, propName: string) {

		if (!propName || typeof proto[propName] === "function") throw new Error("only use @Property decorator on member variables");

		let value: any;

		Object.defineProperty(proto, propName, {
			get () {
				return value;
			},

			set (newValue) {
				if (newValue !== value) { // Same array doesn't rerender
					value = newValue;
					// tslint:disable-next-line:no-invalid-this
					this.render();
				}
			},
			enumerable: true,
			configurable: true
		});

	};
}

/** Execute this function when attribute(s) changes on HTMLElement */
export function Watch(options: {
	/** attribute name(s) */
	attributeName: string | string[];

	// TODO: watch for propery changes?
}) {
	return function (proto: any, functionName: string) {

		if (typeof proto[functionName] !== "function") throw new Error("only use @Watch decorator on member function");
		const ctor = proto.constructor;

		const attributeNames = Array.isArray(options.attributeName) ? options.attributeName : [options.attributeName];

		// tslint:disable:no-invalid-this
		if (attributeNames && ctor) {

			// Create Array if not available
			if (!ctor.observedAttributes) ctor.observedAttributes = [];

			// Add attributeName name to observableAttributes
			attributeNames.forEach(attributeName => {
				if (ctor.observedAttributes.indexOf(attributeName) === -1) ctor.observedAttributes.push(attributeName);
			});

			// patch attributeChangedCallback
			//@ts-ignore
			const oriAttributeChangedCallback = proto.attributeChangedCallback;
			//@ts-ignore
			proto.attributeChangedCallback = function triggeredByWatchDecorator() {
				if (attributeNames.indexOf(arguments[0]) >= 0) {
					this[functionName].apply(this, arguments);
				}
				oriAttributeChangedCallback.apply(this, arguments);
			};
		}
		// tslint:enable:no-invalid-this
	};
}