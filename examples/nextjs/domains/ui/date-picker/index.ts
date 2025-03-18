import { base, Handler } from "@/domains/base";
import { CalendarCore } from "@/domains/ui/calendar";
import { PopoverCore } from "@/domains/ui/popover";
import { ButtonCore } from "@/domains/ui/button";
import dayjs from "dayjs";

export function DatePickerCore(props: { today: Date }) {
  const { today } = props;

  const $popover = new PopoverCore({
    strategy: "fixed",
  });
  const $calendar = CalendarCore({
    today,
  });
  const $btn = new ButtonCore({});
  $calendar.onChange(() => {
    bus.emit(Events.Change, _state.value);
  });

  const _state = {
    get date() {
      if ($calendar.value) {
        return dayjs($calendar.value).format("YYYY/MM/DD");
      }
      return "请选择";
    },
    get value() {
      return $calendar.value;
    },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: typeof _state.value;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "date-picker" as const,
    state: _state,
    get value() {
      return $calendar.value;
    },
    $popover,
    $calendar,
    $btn,
    setValue(v: Date) {
      // console.log("[DOMAIN]ui/date-picker - setValue");
      $calendar.selectDay(v);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type DatePickerCore = ReturnType<typeof DatePickerCore>;
