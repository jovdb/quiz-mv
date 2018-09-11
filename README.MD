
# Quiz

## General
This is a unfinished QUIZ application I created for testing the combination of following technologies:
- Typescript (+ tslint)
- [TypeStyle](https://typestyle.github.io/) for styling
- [HyperHTML](https://viperhtml.js.org/hyperhtml/documentation/) for Custom Elements with template strings
- [Mobx](https://mobx.js.org) for a reactive state
- [Rollup](https://rollupjs.org) for bundling
- [Firebase](https://firebase.google.com/) as reactive database

## Architecture
The application consists out State, Controllers and Custom Elements.

When the application starts it will load some Controllers (example: RouteController, BlockInputController, NavigationController, ...).

Controllers mostly keep the View and the State in sync.
The controller can watch the state and update the UI or it can listen to events from the View and perform the required action (that changes the state).


The state is decorated as observable with MobX to make it reactive, for the View I use Custom Elements (created with HyperHtml)

## States
The data/information the application needs.
I have chosen to use multiple states (playersState, scoreState, routeState) instead of one large state.

Pro:

- It makes the dependencies of a controller smaller
- Feels like my code is more reusable. I can for example drop in a Controller for  showing a Popup that uses its own Custom Element and its own UI state, without the need to add the UI states of this Popup to the 'global' state.
- Mostly a state (for example: routeState) is managed by one Controller (RouteController) and makes it more clear who is responsable for that state.

Contra:
- state is fragmented
- To serialize/store the state, you must construct an object of the required states you want to serialize.
- For debugging I also created global state object that collects state and debug information.


The states are made reactive by using `observableState()`. 
This is a wrapper arround Mobx observable that returns the state as a readonly type.


## Controllers
Custom Elements don't listen directly to the state. Custom Elements will always have a Controller that will instruct them what to do or update.
A Controller will have a UI update method that uses the state. This method is wrapped by `reRunOnStateChange()`: 
- uses MobX autorun for an automatic rerun if state changes.
- adds fancy logging

```
╔═══════╗ Get info    ╔═════════════╗ 1. Update   ╔═════════╗
║ State ╟ ─ ─ ─ ─ ─ ─>║ Controllers ╟────────────>║ Element ║
╚═══════╝             ╚═════════════╝             ╚═════════╝
```

```
// In Controller
function updatePlayers() {
  playersPageElement.isLoading = (playersState.state === LoadState.Loading);
  playersPageElement.players = playersState.value;
}

return reRunOnStateChange(updatePlayers);
```


Controllers will also listen to events (mostly from its Custom Element). When it receives an event it will mostly need to update the state. To update the state we have a `changeState()` function:
- gives you a state with a mutable type signature.
- adds logging of the state change
- creates a MobX transaction.

```
╔═══════╗    2. Update ╔═════════════╗   1. Event ╔═════════╗
║ State ║<─────────────╢ Controllers ║<───────────╢ Element ║
╚═══════╝              ╚═════════════╝            ╚═════════╝
```

```
// In Controller
const unsubscribe = subscribeToEvent(el, "click", e => {
  openMenu(menuState, !!e.detail.isOpen);
});

// In State
function openMenu(menuState: ObservableState<MenuState>, shouldOpen = true) {
	return changeState(data, `openMenu: ${shouldOpen}`, data => {
		data.isMenuOpen = shouldOpen;
	});
}
```

When `changeState()` is performd on a `observableState()`, it will track which state fields are dirty. All functions wrapped with `reRunOnStateChange()` that use a dirty state field will now run again.

### Extra
We have a function `whenStatePropUsed()`  we can use to known when state fields are watched.
Example: when a Controller uses `playersState.players` we can start watching firebase for players and push changes to the state. If nobody listens anymore to the players, we can stop watching the players from firebase.


## Elements
The UI is build with Custom Elements (based on [hyperHTML](https://viperhtml.js.org/hyperhtml/documentation/)).
You should start by extending your element from the HyperElement class
It requires a render method and I added support for slots.

I also created some attributes that should make it easier to build Custom Elements
- @Component: maps the HyperElement with a DOM tag name
- @Property: will automatically trigger a rerender when the value is set
- @Attribute: will sync a DOM attribute with a field.
- @Watch: run a function when a DOM attribute changes

Example:
```
@Component({ tag: "icon-el" })
export class IconElement extends HyperElement {

  @Property()
  private icon: string;

  @Property()
  public color?: string; // Rerender when color changes

  @Attribute({attributeName: "name"})
  public iconName?: string; // Will get/set value from/to attribute

  @Watch({attributeName: "name"})
  protected onIconNameChanged(_attrName: string, _oldVal: string, newVal: string) {
    this.icon = this.getIcon(newVal);
  }

  public render() {
    this.html`<span style=${`color: ${this.color || "black"}`}>${this.icon}</span>`
  }

  private getIcon(iconName: string) {
    switch (iconName) {
      case "star": return "★";
      case "warning": return "⚠";
      default: return "";
    }
  }
}
```

## Usage
Start the [web application here](https://jovdb.github.io/quiz-mv/):

Normally the Quiz is played with multiple users. Each player should login with its own name and the quizmaster should login with '**quizmaster**'.
The quizmaster will have navigation controls.

For testing purposes I create a '**demo**' user. When you login with 'demo' it will simulate multiple users but the navigation is now done automatically.

Also watch the DevTools - Console. I created colorful logging that should help to know what is updated and causing rerenders.