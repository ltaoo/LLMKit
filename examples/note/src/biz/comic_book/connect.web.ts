import { ComicBookCore } from "./index";
import { ComicBookPageCore } from "./page";
import { PageFlipEffect } from "./flip";
import { ElementJQueryLikeCore } from "./element";

export function bind(elm: HTMLElement, node: ElementJQueryLikeCore) {
  node.bind({
    css(styles) {
      const processedStyles = Object.fromEntries(
        Object.entries(styles).map(([key, value]) => {
          // Add 'px' to numeric values for specific properties
          if (
            typeof value === "number" &&
            [
              "width",
              "height",
              "top",
              "left",
              "right",
              "bottom",
              "margin",
              "padding",
              "fontSize",
              "lineHeight",
              "borderWidth",
              "minWidth",
              "maxWidth",
              "minHeight",
              "maxHeight",
            ].includes(key)
          ) {
            return [key, `${value}px`];
          }
          return [key, value];
        })
      );
      Object.assign(elm.style, processedStyles);
    },
    transform(transform: string) {
      elm.style.transform = transform;
    },
    addClass(name: string) {
      elm.classList.add(name);
    },
    offset() {
      return {
        top: elm.offsetTop,
        left: elm.offsetLeft,
      };
    },
    width() {
      return elm.offsetWidth;
    },
    height() {
      return elm.offsetHeight;
    },
    show() {
      elm.style.display = "block";
    },
    hide() {
      elm.style.display = "none";
    },
    is(attr: string) {
      if (attr === ":visible") {
        let element: HTMLElement | null = elm;
        while (element) {
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
            return false;
          }
          element = element.parentElement;
        }
        return true;
      }
      return false;
    },
    parent(): ElementJQueryLikeCore | null {
      const parent = elm.parentElement;
      if (parent) {
        const node = ElementJQueryLikeCore({ tag: parent.tagName, parent: null, name: "parent" });
        bind(parent, node);
        return node;
      }
      return null;
    },
    _elm: elm,
    get elm() {
      return elm;
    },
  });
  // Object.assign(elm.style, node.styles);
}

export function connect3(store: ComicBook<any>, $elm: HTMLElement, $fparent: HTMLElement) {
  bind($fparent, store.$fparent);
  bind($elm, store.$elm);
}

export function connect(store: ComicBookPage<any>, elms: { $page: HTMLElement; $wrap: HTMLElement }) {
  const { $page, $wrap } = elms;
  //   console.log("[Connect] 1 ------------------------ ", $page, $wrap);
  bind($page, store.$page);
  bind($wrap, store.$wrap);
}

export function connect2(
  store: PageFlipEffect,
  eles: {
    $wrap: HTMLElement;
    $page: HTMLElement;
    $ashadow: HTMLElement;
    $tmp: HTMLElement;
  }
) {
  const { $wrap, $page, $ashadow, $tmp } = eles;
  if (store.$fwrapper) {
    bind($wrap, store.$fwrapper);
  }
  if (store.$ashadow) {
    bind($ashadow, store.$ashadow);
  }
  if (store.$fpage) {
    bind($page, store.$fpage);
  }
  if (store.$tmp) {
    bind($tmp, store.$tmp);
  }
}

export function connect4(store: PageFlipEffect, $elm: HTMLElement) {
  if (store.$wrapper) {
    bind($elm, store.$wrapper);
  }
}

export function connect5(store: PageFlipEffect, $elm: HTMLElement) {
  if (store.$bshadow) {
    bind($elm, store.$bshadow);
  }
}
