import { base, Handler } from "./base";
import { LLMAgentCore } from "./llm_agent";
import { ChatBox, ChatBoxPayloadType } from "./chatbox";

export function ChatSessionCore() {
  let _agents: LLMAgentCore[] = [];
  let _inputting: string = "";
  let _boxes: ChatBox[] = [];
}

export type ChatSessionCore = ReturnType<typeof ChatSessionCore>;

export function ChatRoomCore() {
  let _agents: LLMAgentCore[] = [];
  let _inputting: string = "";
  let _sessions: ChatSessionCore[] = [];
  let _session: ChatSessionCore | null = null;
  let _boxes: ChatBox[] = [];

  const _state = {
    get inputting() {
      return _inputting;
    },
    get agents() {
      return _agents.map((agent) => {
        return {
          id: agent.id,
          name: agent.name,
        };
      });
    },
    get boxes() {
      return _boxes.map((box) => {
        return {
          id: box.id,
          sender: box.sender,
          isMe: box.isMe,
          payload: box.payload,
          createdAt: box.createdAt,
          loading: box.loading,
        };
      });
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
    startChat(agents: LLMAgentCore[]) {
      for (let i = 0; i < _agents.length; i += 1) {
        const agent = _agents[i];
        agent.destroy();
      }
      _agents = agents;
      bus.emit(Events.StateChange, { ..._state });
    },
    addAgentToChat(agent: LLMAgentCore) {
      const existing = _agents.find((a) => a.id === agent.id);
      if (existing) {
        return;
      }
      _agents.push(agent);
      bus.emit(Events.StateChange, { ..._state });
    },
    removeAgent(agent: LLMAgentCore) {
      const index = _agents.findIndex((a) => a.id === agent.id);
      if (index === -1) {
        return;
      }
      _agents = [..._agents.slice(0, index), ..._agents.slice(index + 1)];
      bus.emit(Events.StateChange, { ..._state });
    },
    clearAgents() {
      _agents = [];
      bus.emit(Events.StateChange, { ..._state });
    },
    inputting(text: string) {
      _inputting = text;
      bus.emit(Events.StateChange, { ..._state });
    },
    sendMessage(text?: string) {
      const t = text || _inputting.trim();
      if (!t) {
        console.error("请输入内容");
        return;
      }
      _boxes.push(
        ChatBox({
          sender: {
            name: "我",
            isMe: true,
          },
          payload: {
            type: ChatBoxPayloadType.Text,
            text: t,
          },
          created_at: new Date().valueOf(),
        })
      );
      for (let i = 0; i < _agents.length; i += 1) {
        const agent = _agents[i];
        agent.request(t).then((r) => {
          if (r.error) {
            _boxes.push(
              ChatBox({
                sender: {
                  name: agent.name,
                  isMe: false,
                },
                payload: {
                  type: ChatBoxPayloadType.Error,
                  title: "错误",
                  content: r.error.message,
                },
                created_at: new Date().valueOf(),
              })
            );
            bus.emit(Events.StateChange, { ..._state });
            return;
          }
          const box = r.data;
          _boxes.push(box);
          bus.emit(Events.StateChange, { ..._state });
        });
      }
      _inputting = "";
      bus.emit(Events.StateChange, { ..._state });
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ChatRoomCore = ReturnType<typeof ChatRoomCore>;
