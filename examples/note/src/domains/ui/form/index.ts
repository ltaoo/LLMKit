/**
 * @file 多字段 Input
 */
import { base, Handler } from "@/domains/base";

import { FormFieldCore } from "./field";
import { ValueInputInterface } from "./types";
import { Result } from "@/domains/result";

type FormProps<F extends Record<string, FormFieldCore<any>>> = {
  fields: F;
};
// type FieldCore<T> = {
//   name: string;
//   $input: ValueInputInterface<T>;
// };

export function FormCore<
  F extends Record<string, FormFieldCore<{ label: string; name: string; input: ValueInputInterface<any> }>> = {}
>(props: FormProps<F>) {
  const { fields } = props;

  type Value<
    O extends Record<string, FormFieldCore<{ label: string; name: string; input: ValueInputInterface<any> }>>
  > = {
    [K in keyof O]: O[K]["$input"]["value"];
  };

  let _fields: F = fields;
  let _values = {} as Value<F>;
  let _inline = false;

  const _state = {
    get value() {
      return _values;
    },
    get fields() {
      return Object.values(_fields);
    },
    get inline() {
      return _inline;
    },
  };

  enum Events {
    Input,
    Submit,
    Change,
    StateChange,
  }
  type TheTypesOfEvents<T extends Record<string, unknown>> = {
    [Events.Input]: unknown;
    [Events.Submit]: T;
    [Events.Change]: T;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents<Value<F>>>();

  function updateValuesSilence<K extends keyof Value<F>>(name: K, value: Value<F>[K]) {
    // console.log("[DOMAIN]ui/form/index - updateValues", name, value);
    _values[name] = value;
  }
  function updateValues<K extends keyof Value<F>>(name: K, value: Value<F>[K]) {
    // console.log("[DOMAIN]ui/form/index - updateValues", name, value);
    _values[name] = value;
    bus.emit(Events.Change, { ..._state.value });
  }

  const keys: Array<keyof F> = Object.keys(_fields);
  for (let i = 0; i < keys.length; i += 1) {
    const field = _fields[keys[i]];
    updateValuesSilence(field.name, field.$input.value);
    field.$input.onChange((v: any) => {
      console.log("[DOMAIN]ui/form/index - updateValues", field.name, v);
      updateValues(field.name, v);
    });
    field.onShow(() => {
      updateValues(field.name, field.$input.value);
    });
    field.onHide(() => {
      delete _values[field.name];
      bus.emit(Events.Change, { ..._state.value });
    });
  }

  return {
    symbol: "FormCore" as const,
    shape: "form" as const,
    state: _state,
    get value() {
      return _values;
    },
    get fields() {
      return _fields;
    },
    setValue(v: Value<F>, extra: { silence?: boolean } = {}) {
      const keys = Object.keys(_fields);
      for (let i = 0; i < keys.length; i += 1) {
        const field = _fields[keys[i]];
        field.$input.setValue(v[keys[i]], { silence: true });
      }
      _values = v;
      if (!extra.silence) {
        bus.emit(Events.Change, _state.value);
      }
    },
    setInline(v: boolean) {
      _inline = v;
      bus.emit(Events.StateChange, { ..._state });
    },
    // setFieldsValue(nextValues) {}
    input<Key extends keyof Value<F>>(key: Key, value: Value<F>[Key]) {
      _values[key] = value;
      bus.emit(Events.Change, _state.value);
    },
    submit() {
      bus.emit(Events.Submit, _state.value);
    },
    validate() {
      return Result.Ok(_values);
    },
    onSubmit(handler: Handler<TheTypesOfEvents<Value<F>>[Events.Submit]>) {
      bus.on(Events.Submit, handler);
    },
    onInput(handler: Handler<TheTypesOfEvents<Value<F>>[Events.Change]>) {
      bus.on(Events.Change, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents<Value<F>>[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents<Value<F>>[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type FormCore<
  F extends Record<string, FormFieldCore<{ label: string; name: string; input: ValueInputInterface<any> }>> = {}
> = ReturnType<typeof FormCore<F>>;
