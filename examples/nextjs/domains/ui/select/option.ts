/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file Select 选项
 */
import { BaseDomain, Handler } from "@/domains/base";

enum Events {
  Select,
  UnSelect,
  PointerLeave,
  PointerEnter,
  PointerMove,
  Focus,
  Blur,
  StateChange,
}
type TheTypesOfEvents<T> = {
  [Events.Select]: void;
  [Events.UnSelect]: void;
  [Events.PointerLeave]: void;
  [Events.PointerEnter]: void;
  [Events.Focus]: void;
  [Events.Blur]: void;
  [Events.StateChange]: SelectItemState<T>;
};
type SelectItemState<T> = {
  /** 标志唯一值 */
  value: T | null;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
};
type SelectItemProps<T> = {
  name?: string;
  label: string;
  value: T;
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  $node?: () => HTMLElement;
  getRect?: () => DOMRect;
  getStyles?: () => CSSStyleDeclaration;
};

export class SelectOptionCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  name = "SelectOptionCore";
  debug = false;

  text: string;
  value: T;
  _enter = false;
  _selected = false;
  _focused = false;
  _disabled = false;
  _leave = false;

  get state(): SelectItemState<T> {
    return {
      value: this.value,
      selected: this._selected,
      focused: this._focused,
      disabled: this._disabled,
    };
  }

  constructor(props: Partial<{ unique_id: string }> & SelectItemProps<T>) {
    super(props);

    const { name, label, value, $node, getRect, getStyles } = props;
    this.text = label;
    this.value = value;
    if (name) {
      this.name = `${this.name}_${name}`;
    }
    if ($node) {
      this.$node = $node;
    }
    if (getRect) {
      this.getRect = getRect;
    }
    if (getStyles) {
      this.getStyles = getStyles;
    }
  }
  $node(): HTMLElement | null {
    return null;
  }
  getRect() {
    return {} as DOMRect;
  }
  getStyles() {
    return {} as CSSStyleDeclaration;
  }
  get offsetHeight() {
    return this.$node()?.offsetHeight ?? 0;
  }
  get offsetTop() {
    return this.$node()?.offsetTop ?? 0;
  }
  setText(text: SelectOptionCore<T>["text"]) {
    this.text = text;
  }
  select() {
    // console.log("[DOMAIN]ui/select/index - select", this._selected);
    if (this._selected) {
      return;
    }
    this._selected = true;
    this._focused = true;
    this._enter = false;
    this.emit(Events.Select);
    this.emit(Events.StateChange, { ...this.state });
  }
  unselect() {
    if (this._selected === false) {
      return;
    }
    this._selected = false;
    this._focused = false;
    this._enter = false;
    this.emit(Events.UnSelect);
    this.emit(Events.StateChange, { ...this.state });
  }
  focus() {
    this._focused = true;
    this.emit(Events.Focus);
    this.emit(Events.StateChange, { ...this.state });
  }
  blur() {
    this._focused = false;
    this.emit(Events.Blur);
    this.emit(Events.StateChange, { ...this.state });
  }
  handlePointerEnter() {
    // console.log(
    //   "[DOMAIN]ui/select/index - handlePointerEnter",
    //   this._enter,
    //   this._focused
    // );
    if (this._enter === true) {
      return;
    }
    this._enter = true;
    this._focused = true;
    this.emit(Events.PointerEnter);
    this.emit(Events.StateChange, { ...this.state });
  }
  handlePointerMove(pos: { x: number; y: number }) {
    if (this._disabled) {
      this.handlePointerLeave();
      return;
    }
    // console.log("[SelectItemCore]move - prepare focus");
    this.handleFocus();
  }
  handlePointerLeave() {
    if (this._enter === false) {
      return;
    }
    this._enter = false;
    this.emit(Events.PointerLeave);
    this._focused = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  handleClick() {
    if (this._selected === false) {
      this.select();
      return;
    }
    this.unselect();
  }
  handleFocus() {
    if (this._focused === true) {
      return;
    }
    this._focused = true;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Focus);
  }
  handleBlur() {
    if (this._focused === false) {
      return;
    }
    if (this._selected) {
      return;
    }
    this._focused = false;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Blur);
  }

  onPointerLeave(handler: Handler<TheTypesOfEvents<T>[Events.PointerLeave]>) {
    return this.on(Events.PointerLeave, handler);
  }
  onPointerEnter(handler: Handler<TheTypesOfEvents<T>[Events.PointerEnter]>) {
    return this.on(Events.PointerEnter, handler);
  }
  onUnSelect(handler: Handler<TheTypesOfEvents<T>[Events.UnSelect]>) {
    return this.on(Events.UnSelect, handler);
  }
  onSelect(handler: Handler<TheTypesOfEvents<T>[Events.Select]>) {
    return this.on(Events.Select, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
