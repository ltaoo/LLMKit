import { base, Handler } from "@/domains/base";
import { ElementJQueryLikeCore } from "./element";
import { PageFlipEffect } from "./flip";

type ComicBookPageCoreProps<T> = {
  page: number;
  payload: T;
};

export function ComicBookPageCore<T>(props: ComicBookPageCoreProps<T>) {
  let _size = { width: 0, height: 0 };
  let _styles = {
    // "background-image": "linear-gradient(to left, #fff 95%, #ddd 100%)",
  };
  let _wrap_styles = {};
  let _flip: PageFlipEffect | null = null;
  let _displayed = false;
  let _wrap = ElementJQueryLikeCore({
    name: "page_wrap",
    parent: null,
    tag: "div",
    class: "wrap",
    children: [],
    width: 0,
    height: 0,
  });
  let _elm = ElementJQueryLikeCore({
    name: "page_elm",
    parent: _wrap,
    tag: "div",
    class: "page",
    children: [],
    width: 0,
    height: 0,
  });
  let _elm2 = ElementJQueryLikeCore({
    name: "page_elm2",
    parent: _wrap,
    tag: "div",
    class: "page",
    children: [],
    width: 0,
    height: 0,
  });
  // _wrap.appendTo(_page);

  const _methods = {
    setSize(size: { width: number; height: number }) {
      _size = size;
    },
    display() {
      _displayed = true;
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const _state = {
    get page() {
      return props.page;
    },
    get side() {
      return props.page % 2 ? "forward" : "backward";
    },
    get styles() {
      return _styles;
    },
    get wrapStyles() {
      return _wrap_styles;
    },
    get payload() {
      return props.payload;
    },
    get displayed() {
      return _displayed;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  return {
    state: _state,
    methods: _methods,
    get opts() {
      return props;
    },
    get page() {
      return props.page;
    },
    get side() {
      return props.page % 2 ? "forward" : "backward";
    },
    get $wrap() {
      return _wrap;
    },
    get $page() {
      return _elm;
    },
    get $elm() {
      return _elm;
    },
    get $flip() {
      return _flip;
    },
    setFlip(flip: any) {
      _flip = flip;
    },
    onStateChange: (handler: Handler<TheTypesOfEvents[Events.StateChange]>) => {
      bus.on(Events.StateChange, handler);
    },
  };
}

export type ComicBookPageCore<T> = ReturnType<typeof ComicBookPageCore<T>>;
