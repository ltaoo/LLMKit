import { BaseDomain, Handler } from "./base";
import { PresenceCore } from "./presence";

enum Events {
  StateChange,
  Change,
}
type TheTypesOfEvents = {
  [Events.StateChange]: CheckboxState;
  [Events.Change]: boolean;
};
type CheckboxProps = {
  label?: string;
  defaultValue?: boolean;
  checked?: boolean;
  value?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (checked: boolean) => void;
};
type CheckboxState = CheckboxProps & {
  // value: boolean;
};

export class CheckboxCore extends BaseDomain<TheTypesOfEvents> {
  shape = "checkbox" as const;

  label: string;
  disabled: CheckboxProps["disabled"];
  checked: boolean;
  defaultChecked: boolean;
  value: boolean;
  defaultValue: boolean;

  presence: PresenceCore;

  get state(): CheckboxState {
    return {
      label: this.label,
      checked: this.checked,
      value: this.checked,
      disabled: this.disabled,
    };
  }

  prevChecked = false;

  constructor(props: { _name?: string } & CheckboxProps = {}) {
    super(props);

    const {
      label = "",
      disabled = false,
      defaultValue = false,
      checked = false,
      onChange,
    } = props;
    this.label = label;
    this.disabled = disabled;
    this.checked = checked;
    this.defaultChecked = defaultValue;
    this.value = checked;
    this.defaultValue = defaultValue;

    this.presence = new PresenceCore();
    if (onChange) {
      this.onChange(onChange);
    }
  }

  /** 切换选中状态 */
  toggle() {
    const prevChecked = this.checked;
    // console.log("[DOMAIN]checkbox - check", prevChecked);
    (() => {
      if (prevChecked) {
        this.presence.hide();
        return;
      }
      this.presence.show();
    })();
    this.checked = true;
    if (prevChecked) {
      this.checked = false;
    }
    this.prevChecked = prevChecked;
    this.emit(Events.Change, this.checked);
    this.emit(Events.StateChange, { ...this.state });
  }
  check() {
    if (this.checked === true) {
      return;
    }
    this.presence.show();
    this.prevChecked = this.checked;
    this.checked = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  uncheck() {
    if (this.checked === false) {
      return;
    }
    this.presence.hide();
    this.prevChecked = this.checked;
    this.checked = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  reset() {
    this.checked = this.defaultChecked;
  }
  setValue(v: boolean) {
    this.checked = v;
  }

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
