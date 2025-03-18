import { base, Handler } from "@llmkit/libs/base";
import { LLMAgentEditorCore } from "@llmkit/libs/llm_agent";

import { llm_store, agent_store, storage } from "./store";

export function HomePageViewModel() {
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
    },
    ready() {
      const { llm_configs, agent_configs } = storage.values;
      llm_store.patch(llm_configs);
      agent_store.patch(agent_configs);
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
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
