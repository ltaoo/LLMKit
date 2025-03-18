import { base, Handler } from "@/domains/base";

import { getMonthWeeks } from "./utils";

type CalendarWeek = {
  id: number;
  dates: {
    id: number;
    text: string;
    value: Date;
    time: number;
    is_prev_month: boolean;
    is_next_month: boolean;
  }[];
};
type CalendarCoreProps = {
  today: Date;
};

export function CalendarCore(props: CalendarCoreProps) {
  const { today } = props;

  function buildMonthText(d: Date) {
    //     const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return `${month}月`;
  }
  function refreshWeeksOfMonth(d: Date) {
    _weeks = [];
    const r = getMonthWeeks(d, {
      locale: {
        code: "",
      },
      weekStartsOn: 1,
    });
    for (let i = 0; i < r.length; i += 1) {
      const { dates } = r[i];
      _weeks.push({
        id: i,
        dates: dates.map((date, i) => {
          // console.log(date.getDate(), date.valueOf(), date.toLocaleString());
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          return {
            id: i,
            text: date.getDate().toString(),
            is_prev_month: date.getMonth() < d.getMonth(),
            is_next_month: date.getMonth() > d.getMonth(),
            is_today: date.valueOf() === d.valueOf(),
            value: date,
            time: date.valueOf(),
          };
        }),
      });
    }
  }

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  let _day = {
    text: today.getDate().toString(),
    value: today,
    time: today.valueOf(),
  };
  let _month = {
    text: buildMonthText(today),
    value: today,
    time: today.valueOf(),
  };
  let _year = {
    text: today.getFullYear(),
    value: today,
    time: today.valueOf(),
  };
  let _selectedDay = {
    text: today.toLocaleDateString() + today.toLocaleTimeString(),
    value: today,
    time: today.valueOf(),
  };
  let _weeks: CalendarWeek[] = [];

  refreshWeeksOfMonth(today);

  const _state = {
    get day() {
      return _day;
    },
    get month() {
      return _month;
    },
    get year() {
      return _year;
    },
    get weeks() {
      return _weeks;
    },
    get selectedDay() {
      return _selectedDay;
    },
  };

  enum Events {
    SelectDay,
    Change,
  }
  type TheTypesOfEvents = {
    [Events.SelectDay]: Date;
    [Events.Change]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get value() {
      return _selectedDay ? _selectedDay.value : null;
    },
    selectDay(day: Date) {
      //       console.log("[DOMAIN]ui/calendar - selectDay");
      if (_day.value === day) {
        return;
      }
      day.setHours(0);
      day.setMinutes(0);
      day.setSeconds(0);
      day.setMilliseconds(0);
      _day = {
        text: day.getDate().toString(),
        value: day,
        time: day.valueOf(),
      };
      bus.emit(Events.SelectDay, day);
      if (_selectedDay) {
        const prevYear = _selectedDay.value.getFullYear();
        const year = day.getFullYear();
        const prevMonth = _selectedDay.value.getMonth();
        const month = day.getMonth();
        // console.log("[BIZ]check need refresh", prevYear, prevMonth, year, month);
        if (prevYear !== year || prevMonth !== month) {
          _month = {
            text: buildMonthText(day),
            value: day,
            time: day.valueOf(),
          };
          _year = {
            text: day.getFullYear(),
            value: day,
            time: day.valueOf(),
          };
          refreshWeeksOfMonth(day);
        }
      }
      _selectedDay = {
        text: day.toLocaleDateString() + day.toLocaleTimeString(),
        value: day,
        time: day.valueOf(),
      };
      bus.emit(Events.Change, { ..._state });
    },
    nextMonth() {},
    prevMonth() {},
    buildMonthText,
    onSelectDay(handler: Handler<TheTypesOfEvents[Events.SelectDay]>) {
      return bus.on(Events.SelectDay, handler);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
  };
}

export type CalendarCore = ReturnType<typeof CalendarCore>;
