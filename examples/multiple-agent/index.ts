import { base, Handler } from "@llmkit/libs/base";
import { LLMAgentEditorCore } from "@llmkit/libs/llm_agent";
import { ChatBoxPayloadType } from "@llmkit/libs/chatbox";

import { llm_store, agent_store, chatroom, storage } from "./store";

export function AppViewModel() {
  const $editor = LLMAgentEditorCore({
    llm: llm_store,
    agent: agent_store,
  });

  const _state = {
    get providers() {
      return llm_store.state.providers;
    },
    get enabledProviders() {
      return llm_store.state.enabledProviders;
    },
    get pendingProviders() {
      return llm_store.state.pendingProviders;
    },
    get agents() {
      return agent_store.state.agents;
    },
    get agentsInRoom() {
      return chatroom.state.agents;
    },
    get inputting() {
      return chatroom.state.inputting;
    },
    get boxes() {
      return chatroom.state.boxes;
    },
    get loading() {
      return chatroom.state.loading;
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
    ui: {
      $llm: llm_store,
      $agent: agent_store,
      $editor,
      $chatroom: chatroom,
    },
    ready() {
      llm_store.onProviderChange((payload) => {
        storage.set("llm_configs", {
          ...storage.get("llm_configs"),
          [payload.id]: payload,
        });
      });
      $editor.onAgentChange((payload) => {
        storage.set("agent_configs", {
          ...storage.get("agent_configs"),
          [payload.id]: payload,
        });
      });
      $editor.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      llm_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      agent_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      chatroom.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });

      const { llm_configs, agent_configs } = storage.values;
      llm_store.patch(llm_configs);
      agent_store.patch(agent_configs);
    },
    async startChat(agent: { id: number }) {
      const r = await agent_store.findAgentById(agent.id);
      if (r.error) {
        return;
      }
      chatroom.startChat([r.data]);
    },
    async addAgentToChat(agent: { id: number }) {
      const r = await agent_store.findAgentById(agent.id);
      if (r.error) {
        return;
      }
      r.data.debugLLMServicePayload();
      chatroom.addAgentToChat(r.data);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
