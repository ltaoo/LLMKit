import { For, Show } from "solid-js";
import { WebviewWindow, getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { base, Handler } from "@llm/libs/base";
import { LLMAgentCore } from "@llm/libs/llm_agent";

import { agent_store } from "@/store/agents";
import { llm_store } from "@/store/llm";
import { ViewComponentProps } from "@/store/types";
import { DialogCore } from "@/domains/ui";
import { useViewModel } from "@/hooks";
import { Button, Dialog, ListView } from "@/components/ui";
import { DynamicForm } from "@/components/ui/dynamci-form";
import { RequestCore } from "@/domains/request";
import { show_chat_window } from "@/biz/services";

function LLMAgentManagerViewModel(props: ViewComponentProps) {
  const { storage } = props;

  const $agent_dialog = new DialogCore({
    title: "编辑代理",
  });

  const _requests = {
    chat_window: {
      show: new RequestCore(show_chat_window, { client: props.client }),
    },
  };
  const _state = {
    get enabledProviders() {
      return llm_store.state.enabledProviders;
    },
    get agents() {
      return agent_store.state.agents;
    },
    get current_agent() {
      return agent_store.$editor.state;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  $agent_dialog.onOk(() => {
    const payload = agent_store.$editor.toJSON();
    storage.set("agent_configs", {
      ...storage.get("agent_configs"),
      [payload.id]: payload,
    });
  });

  return {
    state: _state,
    ui: {
      $editor: agent_store.$editor,
      $agent_dialog,
      $agents: agent_store,
    },
    ready() {
      agent_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      agent_store.$editor.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      // agents.$editor.onChange((payload) => {
      //   console.log("[STORE] onAgentUpdate", payload);
      //   storage.set("agent_configs", {
      //     ...storage.get("agent_configs"),
      //     [payload.id]: payload,
      //   });
      // });
    },
    async openChatWindow(agent: { id: string; name: string }) {
      console.log("[STORE]openChatWindow", agent);

      const r = await _requests.chat_window.show.run({
        url: "/chat?id=" + agent.id,
      });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      // const webview = new WebviewWindow("chat", {
      //   title: agent.name,
      //   width: 360,
      //   height: 800,
      //   url: "/chat?id=" + agent.id,
      // });
      // webview.show();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LLMAgentManagerPage(props: ViewComponentProps) {
  const [state, $model] = useViewModel(LLMAgentManagerViewModel, [props]);

  return (
    <div class="w-full max-w-[1200px] p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={state().agents}>
          {(agent) => (
            <div class="border rounded-lg p-4 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="text-blue-500 text-xl">🤖</i>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">{agent.name}</h2>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    class="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    onClick={() => {
                      $model.ui.$agents.selectAgent({ id: agent.id });
                      $model.ui.$agent_dialog.show();
                    }}
                  >
                    编辑
                  </button>
                  <button
                    class="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    onclick={() => {
                      $model.openChatWindow(agent);
                    }}
                  >
                    对话
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1">描述</div>
                  <div class="text-gray-600 text-sm">{agent.desc}</div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-1">提示词</div>
                  <div class="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 rounded-md p-2 max-h-[120px] overflow-y-auto line-clamp-3">
                    {agent.prompt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
      {/* 编辑弹窗 */}
      <Dialog store={$model.ui.$agent_dialog}>
        <div class="relative w-[520px] h-[480px] overflow-y-auto p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">名称</label>
            <input
              value={state().current_agent.name}
              type="text"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                $model.ui.$editor.updateName(e.target.value);
              }}
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">描述</label>
            <input
              value={state().current_agent.desc}
              type="text"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                $model.ui.$editor.updateDesc(e.target.value);
              }}
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">提示词</label>
            <textarea
              value={state().current_agent.prompt}
              class="w-full px-3 py-2 border rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                $model.ui.$editor.updatePrompt(e.target.value);
              }}
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">选择模型</label>
            <div class="grid grid-cols-2 gap-4">
              <For each={state().enabledProviders}>
                {(provider) => {
                  return (
                    <div class="border rounded-md p-3">
                      <div class="font-medium text-gray-800 mb-2">{provider.name}</div>
                      <div class="space-y-1">
                        <For each={provider.models}>
                          {(model) => {
                            const isSelected =
                              state().current_agent.provider_id === provider.id &&
                              state().current_agent.model_id === model.id;
                            return (
                              <div
                                class="px-3 py-2 rounded-md cursor-pointer transition-colors"
                                classList={{
                                  "bg-blue-500 text-white hover:bg-blue-600": isSelected,
                                  "hover:bg-gray-100": !isSelected,
                                }}
                                onClick={() => {
                                  $model.ui.$editor.selectProviderModel({
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
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
          <Show when={state().current_agent.provider_configure} keyed={true}>
            <div class="border-t pt-4">
              <DynamicForm store={state().current_agent.provider_configure} />
            </div>
          </Show>
        </div>
      </Dialog>
    </div>
  );
}
