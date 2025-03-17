/**
 * LLM 厂商管理
 */

import { For, Show } from "solid-js";

import { base, Handler } from "@llm/libs/base";

import { llm_store } from "@/store/llm";
import { ViewComponentProps } from "@/store/types";
import {
  update_llm_provider,
  create_provider_model,
  delete_provider_model,
  update_provider_model,
} from "@/biz/services";
import { useViewModel } from "@/hooks";
import { RequestCore } from "@/domains/request";
import { debounce } from "@/utils/lodash/debounce";

function LLMProviderManagerViewModel(props: ViewComponentProps) {
  const _service = {
    llm: {
      provider: {
        update: new RequestCore(update_llm_provider, { client: props.client }),
      },
      model: {
        create: new RequestCore(create_provider_model, { client: props.client }),
        delete: new RequestCore(delete_provider_model, { client: props.client }),
        update: new RequestCore(update_provider_model, { client: props.client }),
      },
    },
  };
  const _state = {
    get providers() {
      return llm_store.state.providers;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  const updateProvider = debounce(
    800,
    (payload: {
      id: string;
      enabled: boolean;
      api_address?: string;
      api_key?: string;
      models: { id: string; enabled: boolean }[];
    }) => {
      _service.llm.provider.update.run(payload);
    }
  );

  return {
    state: _state,
    ui: {
      $manager: llm_store,
    },
    ready() {
      llm_store.onStateChange((values) => {
        // console.log(values.JSON);
        bus.emit(Events.StateChange, { ..._state });
      });
      llm_store.onError((error) => {
        console.error(error.message);
      });
      llm_store.onProviderChange((payload) => {
        // console.log("[PAGE] onProviderChange", payload);
        updateProvider(payload);
      });
      llm_store.onProviderModelCreated((payload) => {
        console.log("[PAGE] onProviderModelCreated", payload);
        _service.llm.model.create.run(payload);
      });
      llm_store.onProviderModelDeleted((payload) => {
        console.log("[PAGE] onProviderModelDeleted", payload);
        _service.llm.model.delete.run(payload);
      });
      llm_store.onProviderModelUpdated((payload) => {
        console.log("[PAGE] onProviderModelUpdated", payload);
        _service.llm.model.update.run(payload);
      });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LLMProviderManagerPage(props: ViewComponentProps) {
  const [state, $model] = useViewModel(LLMProviderManagerViewModel, [props]);

  return (
    <div class="w-full max-w-[1200px] p-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">LLM 服务商</h1>
      <div class="space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
        <For each={state().providers}>
          {(provider) => (
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-[0_1px_3px_0_rgb(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1),0_2px_4px_-2px_rgb(0,0,0,0.05)] transition-all">
              <div class="llm_header flex items-center justify-between mb-4">
                <div class="llm_title flex items-center gap-3">
                  <img
                    class="w-10 h-10 rounded-lg object-contain p-1 border border-gray-200"
                    src={provider.logo_uri}
                    alt={`${provider.name} logo`}
                  />
                  <h2 class="text-lg font-medium text-gray-900">{provider.name}</h2>
                </div>
                <input
                  type="checkbox"
                  class="w-5 h-5 accent-blue-600"
                  checked={provider.enabled}
                  onChange={(e) => {
                    $model.ui.$manager.toggleProviderEnabled({
                      provider_id: provider.id,
                      enabled: e.target.checked,
                    });
                  }}
                />
              </div>
              <div>
                <Show when={provider.enabled}>
                  <div class="space-y-4 mb-4">
                    <div class="space-y-2">
                      <div class="text-sm font-medium text-gray-700">API代理地址</div>
                      <input
                        class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={provider.placeholder}
                        value={provider.apiProxyAddress}
                        onChange={(event) => {
                          $model.ui.$manager.updateProviderApiProxyAddress({
                            provider_id: provider.id,
                            apiProxyAddress: event.target.value,
                          });
                        }}
                      />
                    </div>
                    <div class="space-y-2">
                      <div class="text-sm font-medium text-gray-700">API密钥</div>
                      <input
                        class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={provider.apiKey}
                        onChange={(event) => {
                          $model.ui.$manager.updateProviderApiKey({
                            provider_id: provider.id,
                            apiKey: event.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="text-sm font-medium text-gray-700">模型选择</div>
                    <div class="flex flex-wrap gap-2">
                      <For each={provider.models}>
                        {(model) => (
                          <div class="flex items-center gap-3 py-2 px-4 bg-white rounded-md border border-gray-100 shadow-sm">
                            <div class="text-gray-700">{model.name}</div>
                            <div class="flex items-center gap-3">
                              <Show when={!model.buildin}>
                                <button
                                  class="text-red-500 hover:text-red-600 text-sm font-medium"
                                  onClick={() => {
                                    $model.ui.$manager.deleteProviderModel({
                                      provider_id: provider.id,
                                      model_id: model.id,
                                    });
                                  }}
                                >
                                  删除
                                </button>
                              </Show>
                              <input
                                type="checkbox"
                                class="w-4 h-4 accent-blue-600"
                                checked={model.enabled}
                                onChange={(e) => {
                                  $model.ui.$manager.toggleModelEnabled({
                                    provider_id: provider.id,
                                    model_id: model.id,
                                    enabled: e.target.checked,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </For>
                    </div>

                    <div class="mt-3 pt-3 border-t border-gray-200">
                      <div class="text-sm font-medium text-gray-700 mb-2">添加新模型</div>
                      <div class="flex items-center gap-3">
                        <input
                          class="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          autocomplete="off"
                          autoCapitalize="off"
                          autocorrect="off"
                          placeholder="输入模型名称"
                        />
                        <button
                          class="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          onClick={() => {
                            $model.ui.$manager.addPendingModel({
                              provider_id: provider.id,
                            });
                          }}
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
