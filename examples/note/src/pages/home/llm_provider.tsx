import { For, Show, onMount } from "solid-js";

import { base, Handler } from "@llm/libs/base";

import { llm } from "@/store/llm";
import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";

function LLMProviderManagerViewModel(props: ViewComponentProps) {
  const { storage } = props;

  const _state = {
    get providers() {
      return llm.state.providers;
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
      $manager: llm,
    },
    ready() {
      llm.onStateChange((values) => {
        // console.log(values.JSON);
        bus.emit(Events.StateChange, { ..._state });
      });
      llm.onError((error) => {
        console.error(error.message);
      });
      llm.onProviderChange((payload) => {
        // console.log("[PAGE] onProviderChange", payload);
        storage.set("llm_configs", {
          ...storage.get("llm_configs"),
          [payload.id]: payload,
        });
      });
      const cached = storage.get("llm_configs");
      console.log("[PAGE] before llm.patch", cached);
      llm.patch(cached);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function LLMProviderManagerPage(props: ViewComponentProps) {
  const [state, $model] = useViewModel(LLMProviderManagerViewModel, [props]);

  return (
    <div class="llm_list w-[480px] space-y-6 p-4">
      <For each={state().providers}>
        {(provider) => (
          <div class="border rounded-lg p-4 shadow-sm">
            <div class="llm_header flex items-center justify-between mb-4">
              <div class="llm_title flex items-center gap-3">
                <img
                  class="w-12 h-12 rounded-lg shadow-sm object-contain p-1 border"
                  src={provider.logo_uri}
                  alt={`${provider.name} logo`}
                />
                <h2 class="text-xl font-semibold text-gray-800">{provider.name}</h2>
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
                      class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div class="space-y-3">
                  <For each={provider.models}>
                    {(model) => (
                      <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                        <div class="text-gray-700 font-medium">{model.name}</div>
                        <div class="flex items-center gap-3">
                          <Show when={!model.buildin}>
                            <button
                              class="text-red-500 hover:text-red-600 text-sm"
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
                <div class="flex items-center gap-3 mt-4">
                  <input
                    class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autocomplete="off"
                    autoCapitalize="off"
                    autocorrect="off"
                    placeholder="输入模型名称"
                    //     value={state().pendingModel.id}
                    //     onChange={(event) => {
                    //       $page.ui.$manager.updatePendingModel({
                    //         id: event.target.value,
                    //       });
                    //     }}
                  />
                  <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      $model.ui.$manager.addPendingModel({
                        provider_id: provider.id,
                      });
                    }}
                  >
                    新增model
                  </button>
                </div>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
