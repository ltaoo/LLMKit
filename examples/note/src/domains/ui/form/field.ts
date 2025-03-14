import { BaseDomain, Handler } from "@/domains/base";
import { InputCore } from "@/domains/ui/form/input";
import { DatePickerCore } from "@/domains/ui/date-picker";

import { ListContainerCore } from "./list";
import { FormCore } from "./index";
import { ValueInputInterface } from "./types";

enum Events {
  Show,
  Hide,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hide]: void;
  [Events.StateChange]: FormFieldCoreState;
};
type FormFieldCoreState = {
  label: string;
  name: string;
  required: boolean;
  hidden: boolean;
};
// value: InputCore<any> | DatePickerCore | ListInputCore | FormCore<any>;
// type FormFieldCoreProps = {
//   label: string;
//   name: string;
//   value: ValueInputInterface<any>;
// };

export class FormFieldCore<
  T extends { label: string; name: string; required?: boolean; input: ValueInputInterface<any> }
> extends BaseDomain<TheTypesOfEvents> {
  _label: string;
  _name: string;
  _required = false;
  _hidden = false;
  $input: T["input"];

  get state(): FormFieldCoreState {
    return {
      label: this._label,
      name: this._name,
      required: this._required,
      hidden: this._hidden,
    };
  }
  get label() {
    return this._label;
  }
  get name() {
    return this._name;
  }
  // get $value() {
  //   return this.$value;
  // }

  constructor(props: Partial<{ _name: string }> & T) {
    super(props);

    const { name, label, required = false, input } = props;
    this._name = name;
    this._label = label;
    this._required = required;
    this.$input = input;
  }

  setLabel(label: string) {
    this._label = label;
  }
  setValue(...args: Parameters<typeof this.$input.setValue>) {
    this.$input.setValue(...args);
  }
  hide() {
    if (this._hidden === true) {
      return;
    }
    this._hidden = true;
    this.emit(Events.Hide);
    this.emit(Events.StateChange, { ...this.state });
  }
  show() {
    if (this._hidden === false) {
      return;
    }
    this._hidden = false;
    this.emit(Events.Show);
    this.emit(Events.StateChange, { ...this.state });
  }
  // onInput(handler: Handler<TheTypesOfEvents[Events.Input]>) {
  //   this.on(Events.Input, handler);
  // }
  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hide]>) {
    return this.on(Events.Hide, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
