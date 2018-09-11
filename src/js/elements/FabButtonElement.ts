import { Component } from "./HyperElement";

@Component({ tag: "fab-button" })
export class FabButtonElement extends HTMLButtonElement {

	/** Tagged Template Literal function */
	public html: Function;

	private slots?: any[];

	constructor() {
		/*
		const self = super(...args);
		self.html = hyperHTML.bind(self);
		return self;*/

		super();
		this.html = hyperHTML.bind(this);
	}

	public connectedCallback() {
		this.slots = [...this.childNodes];
		this.render();
	}

	public render() {
		this.html`${this.slots}`; // Sample: added prefix and suffix
	}
}