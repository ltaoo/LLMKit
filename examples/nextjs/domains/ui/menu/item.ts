/**
 * @file 菜单项
 */
import { BaseDomain, Handler } from "@/domains/base";

import { MenuCore } from "./index";

enum Events {
  Enter,
  Leave,
  Focus,
  Blur,
  Click,
  Change,
}
type TheTypesOfEvents = {
  [Events.Enter]: void;
  [Events.Leave]: void;
  [Events.Focus]: void;
  [Events.Blur]: void;
  [Events.Click]: void;
  [Events.Change]: MenuItemCoreState;
};

type MenuItemCoreProps = {
  /** 菜单文案 */
  label: string;
  /** hover 时的提示 */
  tooltip?: string;
  /** 菜单图标 */
  icon?: unknown;
  /** 菜单快捷键/或者说额外内容? */
  shortcut?: string;
  /** 菜单是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 子菜单 */
  menu?: MenuCore;
  /** 点击后的回调 */
  onClick?: () => void;
};
type MenuItemCoreState = MenuItemCoreProps & {
  /** 有子菜单并且子菜单展示了 */
  open: boolean;
  /** 是否聚焦 */
  focused: boolean;
};

export class MenuItemCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuItemCore";
  debug = true;

  label: string;
  tooltip?: string;
  icon?: unknown;
  shortcut?: string;
  /** 子菜单 */
  menu: MenuCore | null = null;

  /** 子菜单是否展示 */
  _open = false;
  _hidden = false;
  _enter = false;
  _focused = false;
  _disabled = false;

  get state(): MenuItemCoreState {
    return {
      label: this.label,
      icon: this.icon,
      shortcut: this.shortcut,
      open: this._open,
      disabled: this._disabled,
      focused: this._focused || this._open,
    };
  }

  constructor(props: Partial<{ unique_id: string }> & MenuItemCoreProps) {
    super(props);

    const {
      unique_id,
      tooltip,
      label,
      icon,
      shortcut,
      disabled = false,
      hidden = false,
      menu,
      onClick,
    } = props;

    this.label = label;
    this.tooltip = tooltip;
    this.icon = icon;
    this.shortcut = shortcut;
    this._hidden = hidden;
    this._disabled = disabled;
    if (unique_id) {
      this._name = unique_id;
    }

    if (menu) {
      this.menu = menu;
      menu.onShow(() => {
        this._open = true;
        this.emit(Events.Change, { ...this.state });
      });
      menu.onHide(() => {
        this._open = false;
        this.emit(Events.Change, { ...this.state });
      });
      // menu.onEnter(() => {
      //   console.log("[DOMAIN]ui/menu/item - handle Menu enter");
      // });
      // this.onBlur(() => {
      //   menu.hide();
      // });
    }
    if (onClick) {
      this.onClick(onClick.bind(this));
    }
  }
  setIcon(icon: unknown) {
    this.icon = icon;
    this.emit(Events.Change, { ...this.state });
  }
  /** 禁用指定菜单项 */
  disable() {
    this._disabled = true;
    this.emit(Events.Change, { ...this.state });
  }
  /** 启用指定菜单项 */
  enable() {
    this._disabled = false;
    this.emit(Events.Change, { ...this.state });
  }
  /** 鼠标进入菜单项 */
  handlePointerEnter() {
    // console.log("[DOMAIN]ui/menu/item - handle pointer enter", this.label, this._enter);
    if (this._enter) {
      return;
    }
    // this.log("enter");
    this._enter = true;
    this._focused = true;
    this.emit(Events.Enter);
    this.emit(Events.Change, { ...this.state });
  }
  handlePointerMove() {
    // console.log("[DOMAIN]ui/menu/item - handle pointer move", this.label);
    // if (this.state.disabled) {
    //   this.handlePointerLeave();
    //   return;
    // }
    // this.handlePointerEnter();
  }
  /** 鼠标离开菜单项 */
  handlePointerLeave() {
    // console.log("[DOMAIN]ui/menu/item - handle pointer leave", this.label, this._enter, this._open);
    if (this._enter === false) {
      return;
    }
    this._enter = false;
    this._focused = false;
    this.emit(Events.Leave);
    this.emit(Events.Change, { ...this.state });
  }
  handleFocus() {
    // console.log("[DOMAIN]ui/menu/item - handle focus", this.label, this._focused);
    if (this._focused) {
      return;
    }
    // this.log("focus");
    this._focused = true;
    this.emit(Events.Focus);
    this.emit(Events.Change, { ...this.state });
  }
  handleBlur() {
    // console.log("[DOMAIN]ui/menu/item - handle blur", this.label, this._focused);
    if (this._focused === false) {
      return;
    }
    this._enter = false;
    this.blur();
  }
  handleClick() {
    if (this._disabled) {
      return;
    }
    this.emit(Events.Click);
  }
  blur() {
    this._focused = false;
    this.emit(Events.Blur);
    this.emit(Events.Change, { ...this.state });
  }
  reset() {
    // console.log("[DOMAIN]ui/menu/item - reset", this.label, this.state.focused);
    // this._disabled = false;
    this._focused = false;
    this._open = false;
    this._enter = false;
    if (this.menu) {
      this.menu.reset();
    }
  }
  hide() {
    this._hidden = true;
  }
  show() {
    this._hidden = false;
  }
  unmount() {
    super.destroy();
    if (this.menu) {
      this.menu.unmount();
    }
    this.reset();
  }

  onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents[Events.Leave]>) {
    return this.on(Events.Leave, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
  onClick(handler: Handler<TheTypesOfEvents[Events.Click]>) {
    return this.on(Events.Click, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  get [Symbol.toStringTag]() {
    return "MenuItem";
  }
}
