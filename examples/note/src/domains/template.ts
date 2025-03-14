import { base, Handler } from "@/domains/base";

export function BaseTemplate() {
  const _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  return {
    state: _state,
    onStateChange: (handler: Handler<TheTypesOfEvents[Events.StateChange]>) => {
      bus.on(Events.StateChange, handler);
    },
  };
}

export type BaseTemplate = ReturnType<typeof BaseTemplate>;
