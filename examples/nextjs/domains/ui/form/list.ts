/**
 * @file 一个用于表单中的动态列表组件
 */
import { base, Handler } from "@/domains/base";

import { FormFieldCore } from "./field";
import { FormCore } from "./index";
import { ValueInputInterface } from "./types";
// import { ValueInputInterface } from "./types";

// type ListInputCoreProps<T extends { defaultValue: any; value: ValueInputInterface<any> }> = {
//   defaultValue: T["defaultValue"];
//   value: FormCore<T>;
// };
export function ListContainerCore<T extends { defaultValue: any; factory: () => any }>(props: T) {
  const { defaultValue, factory } = props;

  const $input = factory();

  if (defaultValue && Array.isArray(defaultValue)) {
    const v = defaultValue[0];
    if ($input && typeof $input.setValue === "function") {
      $input.setValue(v);
    }
  }
  let _factory = factory;
  let _list: { index: number; $input: ReturnType<T["factory"]> }[] = [{ index: 0, $input }];
  let _values = [...defaultValue] as ReturnType<T["factory"]>["value"][];

  const _state = {
    get list() {
      return _list;
    },
    get value() {
      return _values;
    },
    get canRemove() {
      return _list.length > 1;
    },
  };

  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _state.value;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  function handle(item: { index: number; $input: ReturnType<T["factory"]> }, extra: { silence?: boolean } = {}) {
    //     console.log("[DOMAIN]ui/form/list - $input onChange", _values);
    if (item.$input.defaultValue) {
      _values[item.index] = item.$input.defaultValue;
    }
    if (!extra.silence) {
      bus.emit(Events.Change, _state.value);
    }
    item.$input.onChange((v: any) => {
      console.log("[DOMAIN]ui/form/list - $input onChange", v, item.index);
      _values[item.index] = v;
      bus.emit(Events.Change, _state.value);
    });
  }

  for (let i = 0; i < _list.length; i += 1) {
    const $input = _list[i];
    handle($input);
  }

  return {
    symbol: "ListContainerCore" as const,
    shape: "list" as const,
    value: _state.value,
    $value: factory,
    state: _state,
    get list() {
      return _list;
    },
    append() {
      const ins: { index: number; $input: ReturnType<T["factory"]> } = { index: bus.uid(), $input: _factory() };
      //       console.log("[DOMAIN]ui/form/list - append", ins.index);
      handle(ins);
      _list.push(ins);
      bus.emit(Events.StateChange, { ..._state });
      return ins;
    },
    // removeField(v: ReturnType<T["input"]>) {
    //   _list = _list.filter((f) => f !== v);
    //   bus.emit(Events.Change, _state.value);
    // },
    removeFieldByIndex(index: number) {
      if (_list.length === 1) {
        bus.tip({
          text: ["至少保留一个"],
        });
        return;
      }
      _list = _list.filter((f) => f.index !== index);
      _values = _values.filter((_, i) => i !== index);
      bus.emit(Events.Change, _state.value);
      bus.emit(Events.StateChange, { ..._state });
    },
    setValue(v: ReturnType<T["factory"]>["value"][]) {
      _values = v;
      _list = _list.slice(0, v.length);
      for (let i = 0; i < v.length; i += 1) {
        (() => {
          const existing = _list[i];
          if (existing) {
            existing.$input.setValue(v[i], { silence: true });
            return;
          }
          const ins: { index: number; $input: ReturnType<T["factory"]> } = { index: _list.length, $input: _factory() };
          handle(ins, { silence: true });
          ins.$input.setValue(v[i], { silence: true });
          _list.push(ins);
        })();
      }
      bus.emit(Events.Change, _state.value);
      bus.emit(Events.StateChange, { ..._state });
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ListContainerCore<T extends { defaultValue: any; factory: () => any }> = ReturnType<
  typeof ListContainerCore<T>
>;
