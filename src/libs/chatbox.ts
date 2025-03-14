import { base, Handler } from "./base";
import { MutableRecord } from "./types";

// 基础类型使用 enum
export enum ChatBoxPayloadType {
  Text,
  Image,
  Audio,
  Video,
  Error,
  Custom,
}

// 基础 payload 类型
export type ChatBoxPayload = MutableRecord<{
  [ChatBoxPayloadType.Text]: {
    text: string;
  };
  [ChatBoxPayloadType.Image]: {
    url: string;
    width: number;
    height: number;
  };
  [ChatBoxPayloadType.Audio]: {
    url: string;
    duration: number;
  };
  [ChatBoxPayloadType.Video]: {
    url: string;
    cover_url: string;
    width: number;
    height: number;
    duration: number;
  };
  [ChatBoxPayloadType.Error]: {
    title: string;
    content: string;
  };
  [ChatBoxPayloadType.Custom]: {
    data: any;
  };
}>;

type ChatBoxProps = {
  sender: {
    isMe: boolean;
    name: string;
  };
  payload: ChatBoxPayload;
  created_at: number;
  loading?: boolean;
};
export function ChatBox(props: ChatBoxProps) {
  let _sender = props.sender;
  //   let _content: string = props.content;
  let _payload = props.payload;
  let _created_at: number = props.created_at;
  let _loading = props.loading ?? false;

  const _state = {
    get payload() {
      return _payload;
    },
    get loading() {
      return _loading;
    },
  };

  enum Events {
    PayloadChange,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.PayloadChange]: typeof _payload;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get id() {
      return _created_at;
    },
    get sender() {
      return {
        name: _sender.name,
      };
    },
    get isMe() {
      return _sender.isMe;
    },
    get payload() {
      return _payload;
    },
    get createdAt() {
      return _created_at;
    },
    get loading() {
      return _loading;
    },
    updatePayload(payload: ChatBoxPayload) {
      _payload = payload;
      bus.emit(Events.PayloadChange, payload);
      bus.emit(Events.StateChange, { ..._state });
    },
    onPayloadChange(handler: Handler<TheTypesOfEvents[Events.PayloadChange]>) {
      return bus.on(Events.PayloadChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type ChatBox = ReturnType<typeof ChatBox>;
