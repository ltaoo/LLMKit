import { base, Handler } from "@/domains/base";

type SwitchCoreProps = {
  id: string;
  defaultValue: boolean;
  label?: [string, string];
  disabled?: boolean;
};
export function SwitchCore(props: SwitchCoreProps) {
  const { id, label = [], defaultValue, disabled } = props;

  const _id = id;
  let _value = defaultValue;
  let _disabled = disabled;
  let _label = label[Number(defaultValue)] || "";

  const _state = {
    get value() {
      return _value;
    },
    get label() {
      return _label;
    },
    get disabled() {
      return _disabled;
    },
  };
  enum Events {
    Open,
    Close,
    Change,
    LabelChange,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Open]: void;
    [Events.Close]: void;
    [Events.LabelChange]: string;
    [Events.Change]: typeof _value;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  return {
    shape: "switch" as const,
    state: _state,
    id: _id,
    get value() {
      return _value;
    },
    setValue(v: boolean) {
      _value = v;
      _label = label[Number(_value)] || "";
      bus.emit(Events.Change, _value);
      bus.emit(Events.LabelChange, _label);
      bus.emit(Events.StateChange, { ..._state });
    },
    toggle() {
      _value = !_value;
      _label = label[Number(_value)] || "";
      bus.emit(Events.Change, _value);
      bus.emit(Events.LabelChange, _label);
      bus.emit(Events.StateChange, { ..._state });
    },
    disable() {
      _disabled = true;
      bus.emit(Events.StateChange, { ..._state });
    },
    enable() {
      _disabled = false;
      bus.emit(Events.StateChange, { ..._state });
    },
    handleChange(v: boolean) {
      this.setValue(v);
    },
    onOpen(handler: Handler<TheTypesOfEvents[Events.Open]>) {
      return bus.on(Events.Open, handler);
    },
    onClose(handler: Handler<TheTypesOfEvents[Events.Close]>) {
      return bus.on(Events.Close, handler);
    },
    onLabelChange(handler: Handler<TheTypesOfEvents[Events.LabelChange]>) {
      return bus.on(Events.LabelChange, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SwitchCore = ReturnType<typeof SwitchCore>;
