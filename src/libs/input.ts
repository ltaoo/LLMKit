import { BaseDomain, Handler } from "./base";
import { FormInputInterface } from "./form";

enum Events {
  Change,
  StateChange,
  Mounted,
  Focus,
  Blur,
  Enter,
  Clear,
}
type TheTypesOfEvents<T> = {
  [Events.Mounted]: void;
  [Events.Change]: T;
  [Events.Blur]: T;
  [Events.Enter]: T;
  [Events.Focus]: void;
  [Events.Clear]: void;
  [Events.StateChange]: InputState<T>;
};

type InputProps<T> = {
  /** 字段键 */
  name?: string;
  disabled?: boolean;
  defaultValue: T;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: boolean;
  onChange?: (v: T) => void;
  onEnter?: (v: T) => void;
  onBlur?: (v: T) => void;
  onClear?: () => void;
  onMounted?: () => void;
};
type InputState<T> = {
  value: T;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  type: string;
  tmpType: string;
  allowClear: boolean;
  autoFocus: boolean;
  autoComplete: boolean;
};

export class InputCore<T>
  extends BaseDomain<TheTypesOfEvents<T>>
  implements FormInputInterface<T>
{
  shape = "input" as const;
  defaultValue: T;
  value: T;
  placeholder: string;
  disabled: boolean;
  allowClear: boolean = true;
  autoComplete: boolean = false;
  autoFocus: boolean = false;
  type: string;
  loading = false;
  /** 被消费过的值，用于做比较判断 input 值是否发生改变 */
  valueUsed: unknown;
  tmpType = "";

  get state() {
    return {
      value: this.value,
      placeholder: this.placeholder,
      disabled: this.disabled,
      loading: this.loading,
      type: this.type,
      tmpType: this.tmpType,
      autoComplete: this.autoComplete,
      autoFocus: this.autoFocus,
      allowClear: this.allowClear,
    };
  }

  constructor(props: { unique_id?: string } & InputProps<T>) {
    super(props);

    const {
      unique_id,
      defaultValue,
      placeholder = "请输入",
      type = "string",
      disabled = false,
      autoFocus = false,
      autoComplete = false,
      onChange,
      onBlur,
      onEnter,
      onClear,
      onMounted,
    } = props;
    if (unique_id) {
      this.unique_id = unique_id;
    }
    this.placeholder = placeholder;
    this.type = type;
    this.disabled = disabled;
    this.autoComplete = autoComplete;
    this.autoFocus = autoFocus;
    this.defaultValue = defaultValue;
    this.value = defaultValue;
    if (onChange) {
      this.onChange(onChange);
    }
    if (onEnter) {
      this.onEnter(() => {
        onEnter(this.value);
      });
    }
    if (onBlur) {
      this.onBlur(onBlur);
    }
    if (onClear) {
      this.onClear(onClear);
    }
    if (onMounted) {
      this.onMounted(onMounted);
    }
  }
  setMounted() {
    this.emit(Events.Mounted);
  }
  handleEnter() {
    if (this.value === this.valueUsed) {
      return;
    }
    this.valueUsed = this.value;
    this.emit(Events.Enter, this.value);
  }
  handleBlur() {
    if (this.value === this.valueUsed) {
      return;
    }
    this.valueUsed = this.value;
    this.emit(Events.Blur, this.value);
  }
  setLoading(loading: boolean) {
    this.loading = loading;
    this.emit(Events.StateChange, { ...this.state });
  }
  focus() {
    console.log("请在 connect 中实现 focus 方法");
  }
  handleChange(event: unknown) {
    // console.log("[DOMAIN]ui/input - handleChange", event);
    if (this.type === "file") {
      const { target } = event as { target: { files: T } };
      const { files: v } = target;
      this.setValue(v);
      return;
    }
    const { target } = event as { target: { value: T } };
    const { value: v } = target;
    this.setValue(v);
  }
  setValue(value: T, extra: Partial<{ silence: boolean }> = {}) {
    this.value = value;
    if (this.type === "number") {
      this.value = Number(value) as T;
    }
    if (!extra.silence) {
      this.emit(Events.Change, value);
      this.emit(Events.StateChange, { ...this.state });
    }
  }
  setPlaceholder(v: string) {
    this.placeholder = v;
    this.emit(Events.StateChange, { ...this.state });
  }
  enable() {
    this.disabled = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  disable() {
    this.disabled = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  showText() {
    this.tmpType = "text";
    this.emit(Events.StateChange, { ...this.state });
  }
  hideText() {
    this.tmpType = "";
    this.emit(Events.StateChange, { ...this.state });
  }
  clear() {
    console.log("[COMPONENT]ui/input/index - clear", this.defaultValue);
    this.value = this.defaultValue;
    // this.emit(Events.Change, this.value);
    this.emit(Events.Clear);
    this.emit(Events.StateChange, { ...this.state });
  }
  reset() {
    this.value = this.defaultValue;
    this.emit(Events.StateChange, { ...this.state });
  }
  enter() {
    this.emit(Events.Enter);
  }

  onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  onMounted(handler: Handler<TheTypesOfEvents<T>[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents<T>[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onClear(handler: Handler<TheTypesOfEvents<T>[Events.Clear]>) {
    return this.on(Events.Clear, handler);
  }
}
