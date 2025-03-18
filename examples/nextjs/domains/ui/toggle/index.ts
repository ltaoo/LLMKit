import { BaseDomain, Handler } from "@/domains/base";

enum Events {
  True,
  False,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.True]: boolean;
  [Events.False]: boolean;
  [Events.StateChange]: ToggleState;
};
type ToggleProps = {
  boolean?: boolean;
};
type ToggleState = ToggleProps & {};

export class ToggleCore extends BaseDomain<TheTypesOfEvents> {
  boolean?: boolean = false;

  get state(): ToggleState {
    return {
      boolean: this.boolean,
    };
  }

  constructor(options: ToggleProps = {}) {
    super();

    const { boolean = false } = options;
    this.boolean = boolean;
  }

  toggle() {
    this.boolean = !this.boolean;
    this.emit(Events.StateChange, { ...this.state });
  }
  show() {
    this.boolean = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  hide() {
    this.boolean = false;
    this.emit(Events.StateChange, { ...this.state });
  }

  onTrue(handler: Handler<TheTypesOfEvents[Events.True]>) {
    return this.on(Events.True, handler);
  }
  onFalse(handler: Handler<TheTypesOfEvents[Events.False]>) {
    return this.on(Events.False, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
