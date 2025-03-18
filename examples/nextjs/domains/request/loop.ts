/**
 * @file 轮询器
 */
import { base, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";

import { RequestCore } from "./index";

// export class RequestLoop {
// 	request:
// 	constructor(props: { request: RequestCore<any> }) {

// 	}
// }

export function RequestLoop(props: {
  request: RequestCore<any>;
  onComplete: () => void;
  onError: (error: BizError) => void;
}) {
  const { request } = props;

  let _request = request;
  let _args: Parameters<typeof request.run> = [];
  let _need_finish = false;

  function onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
    bus.on(Events.Error, handler);
  }

  async function run(...args: Parameters<typeof request.run>) {
    const r = await _request.run(...args);
    bus.emit(Events.Complete);
    if (_need_finish) {
      return;
    }
    if (r.error) {
      bus.emit(Events.Error, r.error);
    }
    run(...args);
  }

  enum Events {
    Complete,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Complete]: void;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    start(...args: Parameters<typeof request.run>) {
      _args = args;
      run(_args);
    },
    setFinish() {
      _need_finish = true;
    },
    onError,
  };
}
