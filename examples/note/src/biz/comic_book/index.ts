import { base, Handler } from "@/domains/base";

import { PageFlipEffect } from "./flip";
import { ElementJQueryLikeCore } from "./element";
import { ComicBookPageCore } from "./page";
// import { pagesInDOM } from "../turn/constants";

/** 在 DOM 中需要渲染的页面数量 */
const PageCountPrerender = 6;
const PageWrapStyleByPosition: Record<number, { top: string; left: string; right: string; bottom: string }> = {
  0: { top: "0px", left: "0px", right: "auto", bottom: "auto" },
  1: { top: "0px", right: "0px", left: "auto", bottom: "auto" },
};
const DefaultComicBookProps: ComicBookCoreProps = {
  display: "double",
  page: 1,
  page_count: 1,
  width: 0,
  height: 0,
  duration: 600,
  elevation: 50,
  gradients: true,
  acceleration: true,
};
type ComicBookCoreProps = {
  display: "double" | "single";
  page: number;
  //   pages: ComicBookPage[];
  page_count: number;
  width: number;
  height: number;
  duration: number;
  disabled?: boolean;
  gradients: boolean;
  /**
   * Sets the hardware
   * acceleration mode, for
   * touch devices this value
   * must be true.
   */
  acceleration: boolean;
  /**
   * 翻页的阴影
   */
  elevation: number;
};
export enum PageFlipStep {
  Static = "static",
  Turning = "turning",
  Turned = "turned",
  Start = "start",
  End = "end",
}
export function ComicBookCore<T>(props: Partial<ComicBookCoreProps>) {
  const _opts: ComicBookCoreProps = Object.assign(DefaultComicBookProps, props);

  let _initialized = false;
  let _display = _opts.display;
  let _page: number | undefined = undefined;
  let _page_count = _opts.page_count;
  let _pages_map: Record<number, ComicBookPageCore<T>> = {};
  let _wrap_map: Record<number, ElementJQueryLikeCore> = {};
  let _wrap2_map: Record<number, ElementJQueryLikeCore> = {};
  let _flip_map: Record<number, PageFlipEffect> = {};
  let _place_map: Record<number, number> = {};
  let _page_mv: number[] = [];
  let _size = { width: _opts.width, height: _opts.height };
  let _view: number[] = [];
  let _range: number[] = [];
  let _step = PageFlipStep.Static;
  /** 将要展示的页码 */
  let _target_page = 0;
  const _elm = ElementJQueryLikeCore({
    name: "book_elm",
    tag: "div",
    parent: null,
    width: _display === "double" ? _size.width / 2 : _size.width,
    height: _size.height,
  });
  const _fparent = ElementJQueryLikeCore({
    name: "book_fparent",
    tag: "div",
    parent: null,
    width: _display === "double" ? _size.width / 2 : _size.width,
    height: _size.height,
  });

  const _private_methods = {
    /**
     * 根据页码和布局，返回需要展示的页码
     * @example
     * double
     * view(1) => [0, 1]
     * view(5) => [4, 5]
     *
     * single
     * view(1) => [1]
     */
    _view(page?: number) {
      let p = page || _page;
      if (!p) {
        return [0];
      }
      if (_display == "double") {
        return p % 2 ? [p - 1, p] : [p, p + 1];
      }
      return [p];
    },
    /**
     * Returns a range of `pagesInDOM` pages that should be in the DOM
     * Example:
     * - page of the current view, return true
     * * page is in the range, return true
     * 0 page is not in the range, return false
     *
     * 1 2-3 4-5 6-7 8-9 10-11 12-13
     * 0 ** ** -- ** ** 00
     * 返回指定页码需要渲染的页码范围
     * @example
     * range(6) => [4, 9]
     */
    /**
     * Sets a page without effect
     */
    _fitPage(page: number, ok?: boolean) {
      const next_view = _private_methods._view(page);
      console.log("_fit page", _page, page, next_view);
      if (_page !== page) {
        bus.emit(Events.Turning, { page, view: next_view });
        // bus.emit(Events.StateChange, { ..._state });
        if (next_view.includes(1)) {
          bus.emit(Events.First);
        }
        if (next_view.includes(_page_count)) {
          bus.emit(Events.Last);
        }
      }
      console.log("[]_fitPage before _makeRange1", page, _pages_map[page]);
      if (!_pages_map[page]) {
        return;
      }
      _target_page = page;
      _methods.stop(ok);
      _methods._removeFromDOM();
      console.log("[]_fitPage before _makeRange2", page, _pages_map);
      _private_methods._makeRange();
      _step = PageFlipStep.Turned;
      bus.emit(Events.Turned, { page, view: next_view });
      // console.log("[BIZ]comic_book/index _turnPage ============================ TURNED");
      bus.emit(Events.StateChange, { ..._state });
    },
    _turnPage(page: number) {
      let current = 0;
      let next = 0;
      const cur_view = [..._view];
      const next_view = _methods.view(page);
      // console.log("[BIZ]comic_book/index _turnPage ============================ TURNING");
      if (next_view.includes(1)) {
        bus.emit(Events.First);
      }
      if (next_view.includes(_page_count)) {
        bus.emit(Events.Last);
      }
      console.log(
        "[BIZ]comic_book/index _turnPage ============================ TURNING",
        page,
        _pages_map[page],
        next_view
      );
      if (!_pages_map[page]) {
        return;
      }
      _step = PageFlipStep.Turning;
      bus.emit(Events.Turning, { page, view: next_view });
      _target_page = page;

      _methods.stop();
      _private_methods._makeRange();

      if (_display === "single") {
        current = cur_view[0];
        next = next_view[0];
      } else if (cur_view[1] && page > cur_view[1]) {
        current = cur_view[1];
        next = next_view[0];
      } else if (cur_view[0] && page < cur_view[0]) {
        current = cur_view[0];
        next = next_view[1];
      }
      const flip = _flip_map[current];
      if (flip) {
        _target_page = next;
        if (flip.opts.next !== next) {
          flip.opts.next = next;
          _place_map[next] = flip.opts.page;
          // flip.opts.force = true;
        }
        if (_display === "single") {
          flip.methods.turnPage(next_view[0] > cur_view[0] ? "br" : "bl");
        } else {
          flip.methods.turnPage();
        }
      }
    },
    _necessPage(page: number) {
      const range = _methods.range(_page);
      return page >= range[0] && page <= range[1];
    },
    _setPageLoc(page: number, from?: string) {
      const view = _methods.view();

      const tag = (() => {
        if (page === view[0] || page === view[1]) {
          // 在视图内
          return 1;
        }
        if (_display == "single" && page === view[0] + 1) {
          // 视图页码的 前一页后后一页，在翻页时需要展示
          return 2;
        }
        if (_display == "double" && (page === view[0] - 2 || page === view[1] + 2)) {
          return 2;
        }
        // 完全不用展示
        return 0;
      })();
      console.log("_setPageLoc", _page_mv, page, _page, view, tag, _step);
      if (tag === 1) {
        _pages_map[page].$wrap.css({ "z-index": _page_count, display: "" });
      }
      if (tag === 2) {
        _pages_map[page].$wrap.css({ "z-index": _page_count - 1, display: "" });
      }
      if (tag === 0) {
        _pages_map[page].$wrap.css({ "z-index": 0 });
        const $flip = _wrap2_map[page];
        if ($flip) {
          $flip.css({ transform: "unset" });
        }
      }
      return tag;
    },
    _foldingPage() {},
    _moveFoldingPage(bool: boolean | null) {
      const folding = _private_methods._foldingPage();
    },
    _removeMv(page: number) {
      for (let i = 0; i < _page_mv.length; i++) {
        if (_page_mv[i] === page) {
          _page_mv.splice(i, 1);
          return true;
        }
      }
      return false;
    },
    _addMv(page: number) {
      _private_methods._removeMv(page);
      _page_mv.push(page);
    },
    _addMotionPage(page: number) {
      // opts.pageMv = opts.page;
      if (page) {
        const $flip = _flip_map[page];
        $flip.setPageMv($flip.opts.page);
        // $flip.opts.pageMv = $flip.opts.page;
        _private_methods._addMv($flip.pageMv);
        console.log("[TURN]before dd.pagePlace[opts", $flip.opts.next, $flip.opts.page);
        _place_map[$flip.opts.next] = $flip.opts.page;
      }
      _methods.update("addMotionPage");
    },
    _flip(args: { flip: PageFlipEffect }) {
      const { flip } = args;
      bus.emit(Events.Turn, [flip.next]);
      console.log("[BIZ]comic_book/index _flip", flip);
    },
    _start(args: {
      event: { stopPropagation: () => void; preventDefault: () => void };
      flip: PageFlipEffect;
      corner: string;
    }) {
      const { event, flip, corner } = args;
      // _step = PageFlipStep.Start;
      // console.log("[BIZ]comic_book/index _turnPage ============================ START");
      // bus.emit(Events.StateChange, { ..._state });
      if (_display === "single") {
        const left = corner.charAt(1) === "l";
        if ((_page === 1 && left) || (_page === _page_count && !left)) {
          event.preventDefault();
        } else {
          if (left) {
            flip.methods.setNext(flip.next < flip.page ? flip.next : flip.page - 1);
          } else {
            flip.methods.setNext(flip.next > flip.page ? flip.next : flip.page + 1);
          }
        }
      }
      _private_methods._addMotionPage(flip.page);
    },
    _end(args: {
      event: { stopPropagation: () => void; preventDefault: () => void };
      turned: boolean;
      flip: PageFlipEffect;
    }) {
      const { event, turned, flip } = args;
      // _step = PageFlipStep.End;
      // bus.emit(Events.StateChange, { ..._state });
      event.stopPropagation();
      console.log("[BIZ]comic_book/index _end 1", turned, flip.page, flip.next, _target_page);
      if (turned || _target_page) {
        if (_target_page === flip.next || _target_page === flip.page) {
          _target_page = 0;
          // console.log("[BIZ]comic_book/index _end 2");
          _private_methods._fitPage(_target_page || flip.next, true);
        }
      } else {
        // console.log("[BIZ]comic_book/index _end 3");
        _private_methods._removeMv(flip.pageMv);
        _methods.update("end");
      }
    },
    _pressed(args: unknown) {},
    _released(args: unknown) {},
    _makeFlip(page: number) {
      const single = _display == "single";
      const even = page % 2;
      const next = single && page === _page_count ? page - 1 : even || single ? page + 1 : page - 1;
      // 创建 flip 实例准备翻页动画
      const flip = PageFlipEffect({
        $turn: result,
        get $elm() {
          return _pages_map[page].$elm;
        },
        get $wrap() {
          return _pages_map[page].$wrap;
        },
        width: _display === "double" ? _size.width / 2 : _size.width,
        height: _size.height,
        page: page,
        next,
        next_page: _pages_map[next],
        side: even ? "forward" : "backward",
        duration: _opts.duration,
        acceleration: _opts.acceleration,
        corners: single ? "all" : even ? "forward" : "backward",
        backGradient: _opts.gradients,
        frontGradient: _opts.gradients,
      });
      _flip_map[page] = flip;
      if (_wrap2_map[page]) {
        console.log("[BIZ]comic_book/index make_flip - connect4", page, _wrap2_map[page]);
        // connect4(flip, _wrap2_map[page]);
      }
      _pages_map[page].setFlip(flip);
      _pages_map[page].methods.display();
      flip.methods.initialize();
      flip.methods.disable(_opts.disabled);
      flip.onFlip((e) => {
        // console.log("[BIZ]comic_book/index make_flip - flip", e);
        _private_methods._flip({ flip });
      });
      flip.onStart((args) => {
        // console.log("[BIZ]comic_book/index make_flip - start", args);
        _private_methods._start(args);
      });
      flip.onEnd((args) => {
        // console.log("[BIZ]comic_book/index make_flip - end", args);
        _private_methods._end({
          event: {
            stopPropagation: () => {},
            preventDefault: () => {},
          },
          turned: args.turned,
          flip,
        });
      });
      flip.onPressed((args) => {
        console.log("[BIZ]comic_book/index make_flip - pressed", args);
        _private_methods._pressed(args);
      });
      flip.onReleased((args) => {
        console.log("[BIZ]comic_book/index make_flip - released", args);
        _private_methods._released(args);
      });
      _pages_map[page].$elm.css({
        "background-image": `linear-gradient(to ${single || page % 2 ? "left" : "right"}, #fff 90%, #ddd 100%)`,
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    /**  Adds a page from internal data */
    _addPage(index: number) {
      const element = _pages_map[index];
      // console.log("[BIZ]comic_book - _addPage 1", index, element);
      if (!element) {
        return;
      }
      // console.log("[BIZ]comic_book/index add_page - before in_range", index, range);
      if (_private_methods._necessPage(index)) {
        if (!_wrap_map[index]) {
          const size = {
            width: _display === "double" ? _size.width / 2 : _size.width,
            height: _size.height,
          };
          element.$elm.css({
            width: `${size.width}px`,
            height: `${size.height}px`,
          });
          _place_map[index] = index;
          _wrap_map[index] = ElementJQueryLikeCore({
            name: "book_wrap",
            tag: "div",
            parent: _elm,
            width: _display === "double" ? size.width / 2 : size.width,
            height: size.height,
          });
          // _elm.appendTo(_wrap_map[index]);
          element.$wrap.css({
            position: "absolute",
            overflow: "hidden",
            width: `${size.width}px`,
            height: `${size.height}px`,
            ...PageWrapStyleByPosition[_display === "double" ? index % 2 : 0],
          });
          // element.$elm.setParent(_wrap_map[index]);
        }
        const tag = _private_methods._setPageLoc(index);
        // console.log("[BIZ]comic_book/index _addPage before makeFlip", index, tag);
        if (!index || tag === 1) {
          _private_methods._makeFlip(index);
        }
      }
    },
    _makeRange() {
      const range = _methods.range();
      // console.log("[BIZ]comic_book/index make_range - before", range, _initialized);
      for (let page = range[0]; page <= range[1]; page++) {
        _private_methods._addPage(page);
      }
    },
  };
  const _methods = {
    initialize() {
      console.log("[BIZ]comic_book/index initialize", _opts);
      _elm.css({ position: "relative", width: `${_opts.width}px`, height: `${_opts.height}px` });

      _methods.display(_opts.display);
      _methods.page(_opts.page);

      _initialized = true;
    },
    display(display: "double" | "single") {
      if (display === "single") {
        if (!_pages_map[0]) {
          _methods.stop();
          _elm.css({ overflow: "hidden" });
          // _pages_map[0] = ;
        }
        _pages_map[0].$wrap.css({ display: "block" });
      } else {
        if (_pages_map[0]) {
          this.stop();
          _elm.css({ overflow: "" });
        }
      }
      _display = display;
    },
    stop(ok?: boolean) {
      _page_mv = [];
      if (_target_page) {
        _page = _target_page;
        _view = _methods.view(_page);
        _target_page = 0;
      }
      Object.keys(_flip_map).forEach((page) => {
        const $flip = _flip_map[Number(page)];
        _private_methods._moveFoldingPage(null);
        $flip.methods.hideFoldedPage();
        _place_map[$flip.opts.next] = $flip.opts.next;
      });
      _methods.update("stop");
    },
    _saveWrap2(page: number, elm: ElementJQueryLikeCore) {
      _wrap2_map[page] = elm;
    },
    /**
     * 添加页面
     */
    addPage(page: ComicBookPageCore<T>, index: number) {
      let inc_page = false;
      let last_page = _page_count + 1;
      if (index) {
        if (index === last_page) {
          index = last_page;
          inc_page = true;
        } else if (index > last_page) {
          throw new Error("index 不能大于 _page_count");
        }
      } else {
        index = last_page;
        inc_page = true;
      }
      if (index >= 1 && index <= last_page) {
        if (_initialized) {
          _methods.stop();
        }
        if (index in _pages_map) {
          _methods._movePages(index, 1);
        }
        if (inc_page) {
          _page_count = last_page;
        }
        page.$elm.addClass("turn-page p" + page);
        // console.log("before assign _pages_map[index]", index, page);
        _pages_map[index] = page;
        _private_methods._addPage(index);
        // // console.log("[BIZ]comic_book/index addPage - before _initialized", _initialized);
        if (_initialized) {
          _methods.update("addPage");
        }
        _methods._removeFromDOM();
      }
    },
    _movePages(page: number, index: number) {},
    _removeFromDOM() {
      Object.keys(_pages_map).forEach((index) => {
        if (!_private_methods._necessPage(Number(index))) {
          _methods._removePageFromDOM(Number(index));
        }
      });
    },
    _removePageFromDOM(page: number) {
      if (_flip_map[page]) {
        if (_flip_map[page].$fwrapper) {
          // _flip_map[page].$fwrapper.remove();
        }
        // _flip_map[page].$elm.remove();
        delete _flip_map[page];
      }
      if (_pages_map[page]) {
        _pages_map[page].$elm.remove();
        console.log("[BIZ]comic_book/index _removePageFromDOM", page, _methods.range());
        // delete _pages_map[page];
      }
      if (_wrap_map[page]) {
        _wrap_map[page].remove();
        delete _wrap_map[page];
      }
      delete _place_map[page];
      bus.emit(Events.StateChange, { ..._state });
    },
    view(page?: number) {
      const next_page = page || _page;
      // console.log("[]view before _private_methods.view", next_page);
      const view = _private_methods._view(next_page);
      if (_display == "double") {
        return [view[0] > 0 ? view[0] : 0, view[1] <= _page_count ? view[1] : 0];
      }
      return [view[0] > 0 && view[0] <= _page_count ? view[0] : 0];
    },
    // range(page: number) {
    //   return _private_methods.range(page);
    // },
    range(page?: number) {
      const next_page = page || _target_page || _page;
      if (!next_page) {
        return [];
      }
      if (next_page < 1 || next_page > _page_count) {
        return [];
      }
      const view = _private_methods._view(next_page);
      view[1] = view[1] || view[0];
      let left = PageCountPrerender - 1;
      let right = PageCountPrerender - 1;
      if (view[0] >= 1 && view[1] <= _page_count) {
        const remaining_pages = Math.floor((PageCountPrerender - 2) / 2);
        if (_page_count - view[1] > view[0]) {
          left = Math.min(view[0] - 1, remaining_pages);
          right = 2 * remaining_pages - left;
        } else {
          right = Math.min(_page_count - view[1], remaining_pages);
          left = 2 * remaining_pages - right;
        }
      }
      _range = [Math.max(1, view[0] - left), Math.min(_page_count, view[1] + right)];
      return _range;
    },
    update(from?: string) {
      console.log("[TURN]update", _page_mv, from);
      if (_page_mv.length && _page_mv[0] !== 0) {
        let apage: number | undefined;
        const pos = _methods.calculateZ(_page_mv);
        const view = _private_methods._view(_target_page);
        if (_place_map[view[0]] === view[0]) {
          apage = view[0];
        } else if (_place_map[view[1]] === view[1]) {
          apage = view[1];
        }
        Object.keys(_wrap_map).forEach((index: string) => {
          const page = Number(index);
          const $page = _pages_map[page];
          // const wrap = _wrap_map[page];
          // console.log("[BIZ]comic_book/index update - before wrap.css", page, pos.pageV[page], pos.pageZ[page]);
          $page.$wrap.css({ display: pos.pageV[page] ? "" : "none", "z-index": pos.pageZ[page] || 0 });
          const $flip = _flip_map[page];
          if ($flip) {
            $flip.methods.z(pos.partZ[page] || 0);
            if (pos.pageV[page]) {
              $flip.methods.resize();
            }
            if (_target_page) {
              $flip.methods.disable(true);
            }
          }
        });
      } else {
        Object.keys(_wrap_map).forEach((index: string) => {
          const page = Number(index);
          const tag = _private_methods._setPageLoc(page, from);
          const $flip = _flip_map[page];
          if ($flip) {
            $flip.methods.disable(_opts.disabled || tag !== 1);
            $flip.methods.z();
          }
        });
      }
    },
    calculateZ(mv: number[]) {
      console.log("[BIZ]comic_book/index calculateZ 1", mv);
      const view = _methods.view();
      const current_page = view[0] || view[1];
      const r: {
        pageZ: { [key: number]: number };
        partZ: { [key: number]: number };
        pageV: { [key: number]: boolean };
      } = {
        pageZ: {},
        partZ: {},
        pageV: {},
      };
      function addView(page: number) {
        const view = _methods.view(page);
        if (view[0]) {
          r.pageV[view[0]] = true;
        }
        if (view[1]) {
          r.pageV[view[1]] = true;
        }
      }
      for (let i = 0; i < mv.length; i++) {
        const page = mv[i];
        const next_page = _flip_map[page].opts.next;
        const placed_page = _place_map[page];
        addView(page);
        addView(next_page);
        let target_page = page;
        if (_place_map[next_page] === next_page) {
          target_page = next_page;
        }
        console.log("[BIZ]comic_book/index calculateZ - before r.pageZ[target_page]", {
          i,
          page,
          next_page,
          placed_page,
          target_page,
          _page_count,
          current_page,
        });
        r.pageZ[target_page] = _page_count - Math.abs(current_page - target_page);
        r.partZ[placed_page] = _page_count * 2 + Math.abs(current_page - target_page);
      }
      return r;
    },
    refresh() {
      // console.log("[BIZ]comic_book/index refresh", _flip_map);
      bus.emit(Events.StateChange, { ..._state });
    },
    prev() {
      const cur_view = [..._view];
      // const cur_view = [..._view];
      const next_page = cur_view[0] - 1;
      _methods.page(next_page);
      bus.emit(Events.StateChange, { ..._state });
    },
    next() {
      const cur_view = [..._view];
      // const cur_view = [..._view];
      const next_page = cur_view[cur_view.length - 1] + 1;
      _methods.page(next_page);
      bus.emit(Events.StateChange, { ..._state });
    },
    /** 翻到指定页 */
    page(page: number) {
      // console.log("[BIZ]comic_book/index page - before", page, _page_count);
      if (page <= 0 || page > _page_count) {
        return;
      }
      // const view = _methods.view();
      const view = [..._view];
      // console.log("[BIZ]comic_book/index page - before _view.includes", _initialized, _view);
      if (!_initialized || view.includes(page)) {
        // console.log("[BIZ]comic_book - before fit_page", page);
        console.log("[]turnMethods.page before _fitPage.call", page, view, _initialized);
        _private_methods._fitPage(page);
      } else {
        console.log("[]turnMethods.page before _turnPage.call", page, view, _initialized);
        _private_methods._turnPage(page);
      }
      // _page = page;
    },
    existing(page: number) {
      return !!_pages_map[page];
    },
    setSize(size: { width: number; height: number }) {
      _size = size;
    },
    getWrap2(page: number) {
      return _wrap2_map[page];
    },
  };
  const _state = {
    get pages() {
      return Object.values(_pages_map);
    },
    get flips() {
      return Object.values(_flip_map);
    },
    get width() {
      return _size.width;
    },
    get height() {
      return _size.height;
    },
    get view() {
      return _view;
    },
    get range() {
      return _range;
    },
    get page() {
      return _page;
    },
    get step() {
      return _step;
    },
  };
  enum Events {
    Turn,
    /** 开始翻页 */
    Turning,
    /** 翻页完成 */
    Turned,
    /** 第一页 */
    First,
    /** 最后一页 */
    Last,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Turn]: number[];
    [Events.Turning]: { page: number; view: number[] };
    [Events.Turned]: { page: number; view: number[] };
    [Events.First]: void;
    [Events.Last]: void;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  //   _methods.page(_page);
  //   _initialized = true;
  const result = {
    state: _state,
    methods: _methods,
    get $elm() {
      return _elm;
    },
    get $fparent() {
      return _fparent;
    },
    get initialized() {
      return _initialized;
    },
    get display() {
      return _display;
    },
    get page() {
      return _page;
    },
    get pages() {
      return _pages_map;
    },
    get page_count() {
      return _page_count;
    },
    get $pages() {
      return Object.values(_pages_map);
    },
    get $flips() {
      return Object.values(_flip_map);
    },
    onStateChange: (handler: Handler<TheTypesOfEvents[Events.StateChange]>) => {
      bus.on(Events.StateChange, handler);
    },
    onTurning: (handler: Handler<TheTypesOfEvents[Events.Turning]>) => {
      bus.on(Events.Turning, handler);
    },
    onTurned: (handler: Handler<TheTypesOfEvents[Events.Turned]>) => {
      bus.on(Events.Turned, handler);
    },
    onFirst: (handler: Handler<TheTypesOfEvents[Events.First]>) => {
      bus.on(Events.First, handler);
    },
    onLast: (handler: Handler<TheTypesOfEvents[Events.Last]>) => {
      bus.on(Events.Last, handler);
    },
  };
  return result;
}

export type ComicBookCore<T extends any> = ReturnType<typeof ComicBookCore<T>>;
