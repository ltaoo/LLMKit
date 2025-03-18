/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDomain, Handler } from "@/domains/base";

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
type FormFieldCoreProps<T extends ValueInputInterface<any>> = {
  label: string;
  name: string;
  help?: string;
  required?: boolean;
  input: T;
};


/**
 * const $form = FormCore({
 *   fields: {
 *     title: new FormFieldCore({
 *       label: "标题",
 *       // 目前 name 必须和 fields key 相同
 *       name: "title",
 *       input: new InputCore({ defaultValue: "" }),
 *     }),
 *   }
 * });
 */
export class FormFieldCore<
  T extends ValueInputInterface<any>
> extends BaseDomain<TheTypesOfEvents> {
  _label: string;
  _name: string;
  _required = false;
  _hidden = false;
  _help = "";
  $input: T;

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
  get help() {
    return this._help;
  }
  // get $value() {
  //   return this.$value;
  // }

  constructor(props: Partial<{ unique_id: string }> & FormFieldCoreProps<T>) {
    super(props);

    const { name, label, help = "", required = false, input } = props;
    this._name = name;
    this._label = label;
    this._required = required;
    this._help = help;
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
