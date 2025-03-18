import { RequestCore } from "@/domains/request";
import { base, Handler } from "@llmkit/libs/base";
import { HttpClientCore } from "@llmkit/libs/http_client";

import { delete_note, fetch_note_profile, update_note } from "@/biz/services";

type NoteCoreProps = {
  id: number;
  title?: string;
  content?: string;
  client: HttpClientCore;
};

export function NoteCore(props: NoteCoreProps) {
  let _id = props.id;
  let _title = props.title || "";
  let _content = props.content || "";

  const _request = {
    note: {
      profile: new RequestCore(fetch_note_profile, {
        onSuccess(v) {
          _title = v.title;
          _content = v.content;
        },
        client: props.client,
      }),
      update: new RequestCore(update_note, { client: props.client }),
      delete: new RequestCore(delete_note, { client: props.client }),
    },
  };
  const _state = {
    get loading() {
      return _request.note.profile.state.loading;
    },
    get error() {
      return _request.note.profile.state.error;
    },
    get data() {
      return _request.note.profile.state.response;
    },
    get updating() {
      return _request.note.update.state.loading;
    },
    get update_error() {
      return _request.note.update.state.error;
    },
    get title() {
      return _request.note.profile.state.response?.title;
    },
    get content() {
      return _request.note.profile.state.response?.content;
    },
    get created_at() {
      return _request.note.profile.state.response?.created_at;
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
    get id() {
      return _id;
    },
    get title() {
      return _title;
    },
    get content() {
      return _content;
    },
    ready() {},
    load() {
      return _request.note.profile.run({ id: props.id });
    },
    setTitle(title: string) {
      _title = title;
    },
    setContent(content: string) {
      _content = content;
    },
    titleHasChanged(title: string) {
      return title !== _title;
    },
    updateTitle(title?: string) {
      if (title) {
        _title = title;
      }
      return _request.note.update.run({ id: props.id, title: _title });
    },
    contentHasChanged(content: string) {
      return content !== _content;
    },
    updateContent(content?: string) {
      if (content) {
        _content = content;
      }
      return _request.note.update.run({ id: props.id, content: _content });
    },
    delete() {
      return _request.note.delete.run({ id: props.id });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type NoteCore = ReturnType<typeof NoteCore>;
