import { base, Handler } from "@/domains/base";

type ElementJQueryLikeCoreProps = {
  name: string;
  width: number;
  height: number;
  class?: string;
  tag: string;
  parent: null | ElementJQueryLikeCore;
  children?: ElementJQueryLikeCore[];
};

export type TreeNode = {
  tag: string;
  children: TreeNode[] | null;
};
export type TheElementInterface = {
  addClass: (name: string) => void;
  css: (styles: Partial<{ [key: string]: string | number }>) => void;
  transform: (transform: string) => void;
  offset: () => { top: number; left: number };
  parent: () => ElementJQueryLikeCore | null;
  width: () => number;
  height: () => number;
  show: () => void;
  hide: () => void;
  is: (attr: string) => boolean;
  _elm: HTMLElement;
  get elm(): HTMLElement;
};

export function ElementJQueryLikeCore(props: ElementJQueryLikeCoreProps) {
  let _mounted = false;
  let _width = props.width;
  let _height = props.height;
  let _styles: {
    cursor?: string;
    "pointer-events"?: string;
    "z-index"?: string | number;
    overflow?: string;
    position?: string;
    display?: string;
    width?: string | number;
    height?: string | number;
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    "transform-origin"?: string;
    transform?: string;
    "background-image"?: string;
  } = {
    // "background-image": "linear-gradient(to left, #fff 95%, #ddd 100%)",
  };
  let _class = "";
  let _parent = props.parent;
  let _children: ElementJQueryLikeCore[] = props.children || [];
  let _elm: TheElementInterface | null = null;
  let _data: Record<string, any> = {};

  const _methods = {
    width() {
      return _width;
    },
    height() {
      return _height;
    },
    transform(transform: string, origin?: string) {
      const properties: { "transform-origin"?: string; transform?: string } = {};
      if (origin) {
        properties["transform-origin"] = origin;
      }
      properties["transform"] = transform;
      _methods.css(properties);
    },
    css(styles: Partial<typeof _styles>) {
      //       console.log("[BIZ]comic_book/element css", _elm, styles);

      if (!_elm) {
        _styles = {
          ..._styles,
          ...styles,
        };
        // console.warn("请先调用 bind 方法");
        return;
      }
      _elm.css(styles);
      //       _styles = {
      //         ..._styles,
      //         ...styles,
      //       };
    },
    parent() {
      //       if (props.parent) {
      //         return props.parent;
      //       }
      if (!_elm) {
        return null;
      }
      return _elm.parent();
    },
  };
  const _state = {
    get tag() {
      return props.tag;
    },
    get children(): TreeNode[] | null {
      return props.children ? props.children.map((child) => child.state) : null;
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
    get styles() {
      return _styles;
    },
    get $elm() {
      return _elm;
    },
    get name() {
      return props.name;
    },
    //     parent: _methods.parent,
    //     width: _methods.width,
    //     height: _methods.height,
    css: _methods.css,
    transform: _methods.transform,
    getCss(name: keyof typeof _styles) {
      return _styles[name];
    },
    show() {
      this.css({
        display: "block",
      });
    },
    hide() {
      this.css({
        display: "none",
      });
    },
    parent() {
      if (!_elm) {
        return null;
      }
      return _elm.parent();
    },
    addClass(name: string) {
      if (!_elm) {
        _class = name;
        // console.warn("请先调用 bind 方法");
        return;
      }
      _class = name;
      _elm.addClass(_class);
    },
    setAttr(property: string, value: string | number) {},
    appendTo(child: any) {
      _children.push(child);
    },
    remove() {
      // 将自己从 DOM 移除
    },
    setParent(parent: any) {
      _parent = parent;
    },
    bind(node: TheElementInterface) {
      if (_mounted) {
        return;
      }
      _mounted = true;
      _elm = node;
      if (Object.keys(_styles).length > 0) {
        // console.log("[Element]bind", props.name, _styles);
        _methods.css(_styles);
      }
      //       _width = node.width();
      //       _height = node.height();
    },
    data() {
      return _data;
    },
    refresh(info: Partial<{ width: number; height: number }>) {
      if (info.width) {
        _width = info.width;
      }
      if (info.height) {
        _height = info.height;
      }
    },
    width() {
      if (!_elm) {
        return _width;
      }
      return _elm.width();
    },
    height() {
      if (!_elm) {
        return _height;
      }
      return _elm.height();
    },
    children() {
      return _children;
    },
    offset() {
      if (!_elm) {
        return {
          top: 0,
          left: 0,
        };
      }
      return _elm.offset();
    },
    is(attr: string) {
      if (!_elm) {
        return false;
      }
      return _elm.is(attr);
    },
    get _ins() {
      return _elm;
    },
    get elm() {
      return _elm?.elm;
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      bus.on(Events.StateChange, handler);
    },
  };
}

export type ElementJQueryLikeCore = ReturnType<typeof ElementJQueryLikeCore>;
