import { For } from "solid-js";

import { base, Handler } from "@llm/libs/base";

import { agents } from "@/store/agents";
import { llm } from "@/store/llm";
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ListView } from "@/components/ui";
import { DynamicForm } from "@/components/ui/dynamci-form";

function LLMAgentManagerViewModel(props: ViewComponentProps) {
  const { storage } = props;

  const _state = {
    get enabledProviders() {
      return llm.state.enabledProviders;
    },
    get agents() {
      return agents.state.agents;
    },
    get current_agent() {
      return agents.$editor.state;
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
    ready() {
      agents.onChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      agents.$editor.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      agents.$editor.onChange((payload) => {
        console.log("[STORE] onAgentUpdate", payload);
        storage.set("agent_configs", {
          ...storage.get("agent_configs"),
          [payload.id]: payload,
        });
      });
      const cached = storage.get("agent_configs");
      console.log("[STORE]agents - cached", cached);
      agents.patch(cached);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LLMAgentManagerPage(props: ViewComponentProps) {
  const [state, $model] = useViewModel(LLMAgentManagerViewModel, [props]);

  return (
    <div>
      <div class="space-y-6">
        <For each={state().agents}>
          {(agent) => (
            <div>
              <div class="font-medium text-gray-900 mb-4">
                {agent.id}、{agent.name}
              </div>
              <div class="text-gray-700 mb-4">{agent.desc}</div>
              <div class="text-gray-700 mb-4">{agent.prompt}</div>
              <button
                onClick={() => {
                  // $page.ui.$agents.selectAgent({ id: agent.id });
                  // $page.ui.$agent_dialog.show();
                }}
              >
                编辑
              </button>
            </div>
          )}
        </For>
      </div>
      {/* <Dialog store={$page.ui.$agent_dialog}>
        <div class="relative w-[520px] h-[480px]">
          <input
            value={state().current_agent.name}
            type="text"
            onChange={(e) => {
              $page.ui.$editor.updateName(e.target.value);
            }}
          />
          <input
            value={state().current_agent.desc}
            type="text"
            onChange={(e) => {
              $page.ui.$editor.updateDesc(e.target.value);
            }}
          />
          <textarea
            value={state().current_agent.prompt}
            onChange={(e) => {
              $page.ui.$editor.updatePrompt(e.target.value);
            }}
          ></textarea>
          <For each={state().enabledProviders}>
            {(provider) => {
              return (
                <div>
                  <div>{provider.name}</div>
                  <For each={provider.models}>
                    {(model) => {
                      return (
                        <div
                          classList={{
                            "bg-indigo-500 text-white":
                              state().current_agent.provider_id === provider.id &&
                              state().current_agent.model_id === model.id,
                          }}
                          onClick={() => {
                            $page.ui.$editor.selectProviderModel({
                              provider_id: provider.id,
                              model_id: model.id,
                            });
                          }}
                        >
                          <div class="text-sm">{model.name}</div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              );
            }}
          </For>
          <Show when={state().current_agent.provider_configure} keyed={true}>
            <DynamicForm store={state().current_agent.provider_configure} />
          </Show>
        </div>
      </Dialog> */}
    </div>
  );
}
