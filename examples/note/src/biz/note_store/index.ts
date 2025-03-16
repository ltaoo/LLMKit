import { base, Handler } from "@llm/libs/base";
import { HttpClientCore } from "@llm/libs/http_client";

import { RequestCore } from "@/domains/request";
import { create_note, fetch_note_list } from "@/biz/services";
import { ListCore } from "@/domains/list";

type NoteStoreProps = {
  client: HttpClientCore;
};
export function NoteStore(props: NoteStoreProps) {
  const _request = {
    list: new ListCore(new RequestCore(fetch_note_list, { client: props.client })),
    note: {
      create: new RequestCore(create_note, { client: props.client }),
    },
  };
  const _state = {
    get response() {
      return _request.list.response;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  _request.list.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    state: _state,
    ui: {
      $list: _request.list,
    },
    ready() {},
    fetchNotes() {
      _request.list.init();
    },
    unshiftNote(note: { id: number; title: string; created_at: string }) {
      _request.list.modifyResponse((response) => {
        response.dataSource = [note, ...response.dataSource];
        console.log("[BIZ]note_store - unshiftNote", response.dataSource);
        return response;
      });
    },
    createNote() {
      return _request.note.create.run();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
