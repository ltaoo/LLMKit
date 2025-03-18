import { base, Handler } from "@/domains/base";

/**
 * 画布上鼠标相关逻辑
 * 是否按下、移动距离等等
 */
export function CanvasPointer() {
  //   const {} = props;

  /** 按下时的位置 */
  let _mx = 0;
  let _my = 0;
  //   let _cx = 0;
  //   let _cy = 0;
  let _ox = 0;
  let _oy = 0;
  /** 移动时的位置 */
  let _mx2 = 0;
  let _my2 = 0;

  let _pressing = false;
  /** 当前是否处于拖动 */
  let _dragging = false;
  //   let _timer_is_click: null | NodeJS.Timer = null;
  //   let _timer2: null | NodeJS.Timer = null;
  let _maybe_click_timer: null | NodeJS.Timeout = null;
  let _click_count = 0;

  enum Events {
    PointerDown,
    PointerMove,
    PointerUp,
    Click,
    DoubleClick,
    LongPress,
    Update,
  }
  type TheTypesOfEvents = {
    [Events.PointerDown]: void;
    [Events.PointerMove]: {
      x: number;
      y: number;
      dx: number;
      dy: number;
      pressing: boolean;
    };
    [Events.PointerUp]: void;
    [Events.Click]: { x: number; y: number };
    [Events.DoubleClick]: { x: number; y: number };
    [Events.LongPress]: { x: number; y: number };
    [Events.Update]: void;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    get pressing() {
      return _pressing;
    },
    get dragging() {
      return _dragging;
    },
    get instanceOfMoving() {
      return {
        x: _ox,
        y: _oy,
      };
    },
    //     getCurPath() {
    //       return _cur_line_path;
    //     },
    getMousePoint() {
      return {
        x: _mx2,
        y: _my2,
        // text: `${_mx2 - _grid.x},${_my2 - _grid.y}`,
        text: `${_mx2},${_my2}`,
      };
    },
    handleMouseDown(pos: { x: number; y: number }) {
      _mx = pos.x;
      _my = pos.y;
      _pressing = true;
      _click_count += 1;
      // _timer_is_click = setTimeout(() => {
      //   if (!_pressing && _click_count === 1) {
      //     bus.emit(Events.Click, pos);
      //   }
      //   _click_count = 0;
      //   _timer_is_click = null;
      // }, 300);
      if (_maybe_click_timer) {
        clearTimeout(_maybe_click_timer);
        _maybe_click_timer = null;
      }
      // _timer2 = setTimeout(() => {
      //   if (_pressing && !_dragging) {
      //     bus.emit(Events.LongPress, pos);
      //   }
      // }, 600);
      bus.emit(Events.PointerDown);
    },
    handleMouseMove(pos: { x: number; y: number }) {
      const { x, y } = pos;
      _mx2 = x;
      _my2 = y;
      if (!_pressing) {
        return;
      }
      /** x方向移动的距离 */
      _ox = pos.x - _mx;
      /** y方向移动的距离 */
      _oy = pos.y - _my;
      _dragging = true;
      bus.emit(Events.PointerMove, {
        x,
        y,
        dx: _ox,
        dy: _oy,
        pressing: _pressing,
      });
    },
    handleMouseUp(pos: { x: number; y: number }) {
      //       const copy_pressing = _pressing;
      const copy_dragging = _dragging;
      const timer = setTimeout(() => {
        // there is no click duration 200ms after mouse up
        // so we can say it is a click event?
        // console.log("[BIZ]canvas/mouse - in maybe_click_timer", _click_count, copy_dragging, copy_pressing);
        if (_click_count === 2) {
          _click_count = 0;
          bus.emit(Events.DoubleClick, pos);
          return;
        }
        if (_click_count === 1) {
          _click_count = 0;
          if (copy_dragging) {
            return;
          }
          bus.emit(Events.Click);
          return;
        }
        // console.log("[BIZ]canvas/mouse - handleMouseUp", _click_count, _timer_is_click, _timer2);
      }, 100);
      _maybe_click_timer = timer;
      // if (_click_count === 2) {
      //   bus.emit(Events.DoubleClick, pos);
      //   _click_count = 0;
      //   if (_timer_is_click) {
      //     clearTimeout(_timer_is_click);
      //     _timer_is_click = null;
      //   }
      //   if (_timer2) {
      //     clearTimeout(_timer2);
      //     _timer2 = null;
      //   }
      // }
      _pressing = false;
      _dragging = false;
      _mx = 0;
      _my = 0;
      _mx2 = 0;
      _my2 = 0;
      _ox = 0;
      _oy = 0;
      bus.emit(Events.PointerUp);
    },

    onMove(handler: Handler<TheTypesOfEvents[Events.PointerMove]>) {
      return bus.on(Events.PointerMove, handler);
    },
    onClick(handler: Handler<TheTypesOfEvents[Events.Click]>) {
      return bus.on(Events.Click, handler);
    },
    onDoubleClick(handler: Handler<TheTypesOfEvents[Events.DoubleClick]>) {
      return bus.on(Events.DoubleClick, handler);
    },
    onPointerUp(handler: Handler<TheTypesOfEvents[Events.PointerUp]>) {
      return bus.on(Events.PointerUp, handler);
    },
    onLongPress(handler: Handler<TheTypesOfEvents[Events.LongPress]>) {
      return bus.on(Events.LongPress, handler);
    },
  };
}

export type CanvasPointer = ReturnType<typeof CanvasPointer>;
