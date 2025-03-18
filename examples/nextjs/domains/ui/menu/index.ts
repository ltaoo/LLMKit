/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file 菜单 组件
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PopperCore, Side, Align } from "@/domains/ui/popper";
import { DismissableLayerCore } from "@/domains/ui/dismissable-layer";
import { PresenceCore } from "@/domains/ui/presence";
import { Direction } from "@/domains/ui/direction";

import { MenuItemCore } from "./item";

enum Events {
  Show,
  Hidden,
  EnterItem,
  LeaveItem,
  EnterMenu,
  LeaveMenu,
  Change,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.EnterItem]: MenuItemCore;
  [Events.LeaveItem]: MenuItemCore;
  [Events.EnterMenu]: void;
  [Events.LeaveMenu]: void;
  [Events.Change]: MenuCoreState;
};
type MenuCoreState = {
  /** 是否是展开状态 */
  open: boolean;
  hover: boolean;
  /** 所有选项 */
  items: MenuItemCore[];
};
type MenuCoreProps = {
  side: Side;
  align: Align;
  strategy: "fixed" | "absolute";
  items: MenuItemCore[];
};

export class MenuCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuCore";
  debug = false;

  popper: PopperCore;
  presence: PresenceCore;
  layer: DismissableLayerCore;

  open_timer: NodeJS.Timeout | null = null;

  state: MenuCoreState = {
    open: false,
    hover: false,
    items: [],
  };

  constructor(options: Partial<{ unique_id: string } & MenuCoreProps> = {}) {
    super(options);
    const { unique_id, items = [], side, align, strategy } = options;
    if (unique_id) {
      this._name = unique_id;
    }
    this.state.items = items;
    this.items = items;

    this.popper = new PopperCore({
      side,
      align,
      strategy,
      unique_id: unique_id ? `${unique_id}__popper` : "menu__popper",
    });
    this.presence = new PresenceCore();
    this.layer = new DismissableLayerCore();

    this.listen_items(items);

    this.popper.onEnter(() => {
      console.log("[DOMAIN]ui/menu/index - handle Enter popper");
      this.state.hover = true;
      this.emit(Events.EnterMenu);
    });
    this.popper.onLeave(() => {
      this.state.hover = false;
      this.emit(Events.LeaveMenu);
    });
    this.layer.onDismiss(() => {
      // console.log("[DOMAIN/ui]menu/index - hide");
      // console.log("[DOMAIN]ui/menu/index - this.layer.onDismiss");
      this.hide();
    });
    this.presence.onHidden(() => {
      console.log(
        "[DOMAIN]ui/menu/index - presence.onHidden",
        this.cur_item?.label
      );
      this.reset();
      if (this.cur_item) {
        this.cur_item.blur();
      }
      if (this.cur_sub) {
        this.cur_sub.hide();
      }
    });
  }

  // subs: MenuCore[] = [];
  items: MenuItemCore[] = [];
  cur_sub: MenuCore | null = null;
  cur_item: MenuItemCore | null = null;
  inside = false;
  /** 鼠标是否处于子菜单中 */
  in_sub_menu = false;
  /** 鼠标离开 item 时，可能要隐藏子菜单，但是如果从有子菜单的 item 离开前往子菜单，就不用隐藏 */
  maybe_hide_sub = false;
  hide_sub_timer: NodeJS.Timeout | null = null;

  toggle() {
    const { open } = this.state;
    // this.log("toggle", open);
    if (open) {
      this.hide();
      return;
    }
    this.show();
  }
  show() {
    if (this.state.open) {
      return;
    }
    // console.log("[DOMAIN]ui/menu/index - hide");
    this.state.open = true;
    this.presence.show();
    this.popper.place();
    this.emit(Events.Show);
    // this.emit(Events.StateChange, { ...this.state });
  }
  hide() {
    if (this.state.open === false) {
      return;
    }
    // console.log("[DOMAIN]ui/menu/index - hide");
    this.state.open = false;
    // this.log("hide");
    this.presence.hide({ destroy: true });
    this.emit(Events.Hidden);
    this.emit(Events.Change, { ...this.state });
  }
  /** 处理选项 */
  listen_item(item: MenuItemCore) {
    //  const item = items[i];
    item.onEnter(() => {
      // this.maybeHideSub = false;
      // if (item.menu) {
      //   this.maybeHideSub = false;
      //   const subMenu = item.menu;
      //   subMenu.show();
      // }
      // if (!item.menu && this.curSub) {
      //   this.curSub.hide();
      // }
      console.log(
        "[DOMAIN]ui/menu/index - item.onEnter",
        item.label,
        item.menu,
        this.cur_item?.label
      );
      this.emit(Events.EnterItem, item);
      if (item.menu) {
        item.menu.show();
      }
      if (this.cur_item && this.cur_item !== item) {
        this.cur_item.blur();
        if (this.cur_item.menu) {
          this.cur_item.menu.hide();
        }
      }
      this.cur_item = item;
    });
    // 考虑清楚 menu item 选中状态,到底表达了什么,在什么情况下,会出现 选中状态
    // 表达了两个含义 1是鼠标悬浮于 item 上   2是item 有子菜单且子菜单属于打开状态
    item.onLeave(() => {
      console.log(
        "[DOMAIN]ui/menu/index - item.onLeave",
        item.label,
        { open: item._open, focused: item._focused },
        item.menu?.state
      );
      // this.maybeHideSub = true;
      this.emit(Events.LeaveItem, item);
      item.blur();
      if (item.menu) {
        const timer = setTimeout(() => {
          item.menu!.hide();
          // this.cur_item = null;
        }, 0);
        item.menu.onEnter(() => {
          console.log("[DOMAIN]ui/menu/index - item.menu.onEnter");
          if (timer) {
            clearTimeout(timer);
          }
        });
        return;
      }
      // this.checkNeedHideSubMenu(item);
      // this.log("item.onLeave", this.items.length);
      // if (this.hideSubTimer !== null) {
      //   clearInterval(this.hideSubTimer);
      //   this.hideSubTimer = setTimeout(() => {
      //     this.checkNeedHideSubMenu(item);
      //   }, 100);
      //   return;
      // }
      // this.hideSubTimer = setTimeout(() => {
      //   this.checkNeedHideSubMenu(item);
      // }, 100);
    });
    if (!item.menu) {
      return;
    }
    // const sub_menu = item.menu;
    // sub_menu.onShow(() => {
    //   this.log("sub.onShow");
    //   this.cur_sub = sub_menu;
    // });
    // sub_menu.onEnter(() => {
    //   this.log("sub.onEnter");
    //   this.in_sub_menu = true;
    // });
    // sub_menu.onLeave(() => {
    //   this.log("sub.onLeave");
    //   this.in_sub_menu = false;
    // });
    // sub_menu.onHide(() => {
    //   this.log("sub.onHide");
    //   this.cur_sub = null;
    // });
    // if (this.subs.includes(subMenu)) {
    //   return;
    // }
    // this.subs.push(subMenu);
  }
  listen_items(items: MenuItemCore[]) {
    // this.log("listen items", items);
    for (let i = 0; i < items.length; i += 1) {
      this.listen_item(items[i]);
    }
  }
  setItems(items: MenuItemCore[]) {
    console.log("[DOMAIN]ui/menu - set items", items);
    this.state.items = items;
    this.items = items;
    this.listen_items(items);
    this.emit(Events.Change, {
      ...this.state,
    });
  }
  checkNeedHideSubMenu(item: MenuItemCore) {
    // console.log("[DOMAIN]ui/menu/index - checkNeedHideSubMenu", item.label, this.maybeHideSub, this.curSub);
    // if (this.hideSubTimer) {
    //   clearTimeout(this.hideSubTimer);
    // }
    // this.hideSubTimer = null;
    // if (this.maybeHideSub === false) {
    //   return;
    // }
    // this.log("leaveMenu check need hide subMenu", this.curSub, this.inSubMenu);
    // this.emit(Events.LeaveMenu);
    // 直接从有 SubMenu 的 MenuItem 离开，不到其他 MenuItem 场景下，也要关闭 SubMenu
    // if (this.curSub && !this.inSubMenu) {
    //   this.curSub.hide();
    // }
  }
  reset() {
    // console.log("[]MenuCore - reset", this.items);
    this.in_sub_menu = false;
    // this.cur_item = null;
    this.cur_sub = null;
    this.maybe_hide_sub = false;
    this.hide_sub_timer = null;
    this.state.open = false;
    this.presence.reset();
    this.popper.reset();
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].reset();
    }
  }
  unmount() {
    // this.log("destroy", this.name);
    super.destroy();
    this.layer.destroy();
    this.popper.destroy();
    this.presence.unmount();
    // for (let i = 0; i < this.subs.length; i += 1) {
    //   this.subs[i].unmount();
    // }
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].unmount();
    }
    this.reset();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onEnterItem(handler: Handler<TheTypesOfEvents[Events.EnterItem]>) {
    return this.on(Events.EnterItem, handler);
  }
  onLeaveItem(handler: Handler<TheTypesOfEvents[Events.LeaveItem]>) {
    return this.on(Events.LeaveItem, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents[Events.EnterMenu]>) {
    return this.on(Events.EnterMenu, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents[Events.LeaveMenu]>) {
    return this.on(Events.LeaveMenu, handler);
  }
  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  get [Symbol.toStringTag]() {
    return "Menu";
  }
}

const SELECTION_KEYS = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN_KEYS: Record<Direction, string[]> = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"],
};
const SUB_CLOSE_KEYS: Record<Direction, string[]> = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
};
