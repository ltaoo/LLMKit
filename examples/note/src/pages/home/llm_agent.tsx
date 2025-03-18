/**
 * LLM 助手管理
 */
import { For, Show } from "solid-js";
import Trash from "lucide-solid/icons/trash-2";
import PenEdit from "lucide-solid/icons/edit-2";

import { base, Handler } from "@llmkit/libs/base";
import { LLMAgentEditorCore } from "@llmkit/libs/llm_agent";

import { agent_store } from "@/store/agents";
import { llm_store } from "@/store/llm";
import { ViewComponentProps } from "@/store/types";
import {
  fetch_llm_agents,
  show_chat_window,
  update_llm_agent,
  create_llm_agent,
  delete_llm_agent,
} from "@/biz/services";
import { useViewModel } from "@/hooks";
import { DialogCore } from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { Dialog } from "@/components/ui";
import { DynamicForm } from "@/components/ui/dynamci-form";
import { RequestCore } from "@/domains/request";

function LLMAgentManagerViewModel(props: ViewComponentProps) {
  const $agent_dialog = new DialogCore({
    title: "编辑代理",
  });
  const $editor = LLMAgentEditorCore({ llm: llm_store, agent: agent_store });

  const _service = {
    chat_window: {
      show: new RequestCore(show_chat_window, { client: props.client }),
    },
    agent: {
      list: new ListCore(new RequestCore(fetch_llm_agents, { client: props.client })),
      update: new RequestCore(update_llm_agent, { client: props.client }),
      create: new RequestCore(create_llm_agent, { client: props.client }),
      delete: new RequestCore(delete_llm_agent, { client: props.client }),
    },
  };
  const _state = {
    get agents() {
      return [...agent_store.state.agents];
    },
    get enabledProviders() {
      return llm_store.state.enabledProviders;
    },
    get current_agent() {
      return {
        id: $editor.state.id,
        name: $editor.state.name,
        desc: $editor.state.desc,
        prompt: $editor.state.prompt,
        builtin: $editor.state.builtin,
        provider_id: $editor.state.llm.provider_id,
        model_id: $editor.state.llm.model_id,
        provider_configure: $editor.providerConfigure,
      };
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();
  $agent_dialog.onOk(async () => {
    const payload = $editor.toJSON();
    const r = await (() => {
      if ($editor.isCreateAgent) {
        return _service.agent.create.run(payload);
      }
      return _service.agent.update.run(payload);
    })();
    if (r.error) {
      props.app.tip({
        text: [r.error.message],
      });
      return;
    }
    $agent_dialog.hide();
    _service.agent.list.init();
  });

  return {
    state: _state,
    ui: {
      $editor,
      $agent_dialog,
      $agent_store: agent_store,
    },
    ready() {
      agent_store.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      $editor.onStateChange(() => {
        bus.emit(Events.StateChange, { ..._state });
      });
      _service.agent.list.onDataSourceAdded((payload) => {
        const agents = payload.map((item) => {
          const r = agent_store.buildFromOuter(item);
          if (r.error) {
            return null;
          }
          return r.data;
        });
        const agents2 = agents.filter((item) => item !== null);
        agent_store.setAgents(agents2);
        bus.emit(Events.StateChange, { ..._state });
      });
      _service.agent.list.init();
    },
    async openChatWindow(agent: { id: string; name: string }) {
      const r = await _service.chat_window.show.run({
        url: "/chat?id=" + agent.id,
      });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
    },
    showAgentCreateDialog() {
      $editor.startCreateAgent();
      $agent_dialog.setTitle("新增 Agent");
      $agent_dialog.show();
    },
    async showAgentEditDialog(agent: { id: number | string }) {
      const r = await agent_store.findAgentById(agent.id);
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      $editor.selectAgent(r.data);
      $agent_dialog.setTitle(`${r.data.name} - 编辑`);
      $agent_dialog.show();
    },
    async deleteAgent(agent: { id: number | string }) {
      const r = await _service.agent.delete.run({
        id: agent.id,
      });
      if (r.error) {
        props.app.tip({
          text: [r.error.message],
        });
        return;
      }
      agent_store.removeAgents([agent.id.toString()]);
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
      {/* Add New Agent Button */}
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">AI 助手</h1>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          onClick={() => $model.showAgentCreateDialog()}
        >
          <i class="i-carbon-add text-lg"></i>
          新增助手
        </button>
      </div>
      {/* Agents Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-100px)] overflow-y-auto">
        <For each={state().agents}>
          {(agent) => (
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all relative">
              <div class="absolute top-4 right-4 flex items-center gap-2">
                <button
                  class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    $model.showAgentEditDialog(agent);
                  }}
                >
                  <PenEdit class="w-4 h-4" />
                </button>
                <Show when={agent.builtin === false}>
                  <button
                    class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => {
                      $model.deleteAgent(agent);
                    }}
                  >
                    <Trash class="w-4 h-4" />
                  </button>
                </Show>
              </div>
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 font-medium">🤖</span>
                </div>
                <div>
                  <h2 class="text-gray-900 font-medium">{agent.name}</h2>
                  <p class="text-sm text-gray-500">{agent.desc}</p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <div class="text-sm font-medium text-gray-600 mb-1.5">提示词</div>
                  <div class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100 line-clamp-3 h-[4.5em] overflow-hidden">
                    {agent.prompt}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  onclick={() => {
                    $model.openChatWindow(agent);
                  }}
                >
                  开始对话
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      <Dialog store={$model.ui.$agent_dialog}>
        <div class="relative w-[560px] max-h-[80vh] overflow-y-auto space-y-6">
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">名称</div>
            <input
              disabled={state().current_agent.builtin}
              value={state().current_agent.name}
              type="text"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onChange={(e) => {
                $model.ui.$editor.updateName(e.target.value);
              }}
            />
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">描述</div>
            <input
              disabled={state().current_agent.builtin}
              value={state().current_agent.desc}
              type="text"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onChange={(e) => {
                $model.ui.$editor.updateDesc(e.target.value);
              }}
            />
          </div>

          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">提示词</div>
            <textarea
              disabled={state().current_agent.builtin}
              value={state().current_agent.prompt}
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg h-32 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onChange={(e) => {
                $model.ui.$editor.updatePrompt(e.target.value);
              }}
            ></textarea>
          </div>
          <div class="space-y-3">
            <div class="text-sm font-medium text-gray-700">选择模型</div>
            <div class="grid grid-cols-2 gap-4">
              <For each={state().enabledProviders}>
                {(provider) => {
                  return (
                    <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div class="font-medium text-gray-800 mb-3">{provider.name}</div>
                      <div class="space-y-2">
                        <For each={provider.models}>
                          {(model) => {
                            const isSelected =
                              state().current_agent.provider_id === provider.id &&
                              state().current_agent.model_id === model.id;
                            return (
                              <div
                                class="px-4 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
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
                                <div class="text-sm font-medium">{model.name}</div>
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
            <div class="border-t border-gray-200 pt-4">
              <DynamicForm store={state().current_agent.provider_configure} />
            </div>
          </Show>
        </div>
      </Dialog>
    </div>
  );
}
