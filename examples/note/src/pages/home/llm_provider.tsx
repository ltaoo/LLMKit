import { For, Show } from "solid-js";

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
      llm.onChange((values) => {
        console.log(values.JSON);
        bus.emit(Events.StateChange, { ..._state });
      });
      llm.onProviderChange((payload) => {
        storage.set("llm_configs", {
          ...storage.get("llm_configs"),
          [payload.id]: payload.value,
        });
      });
      const cached = storage.get("llm_configs");
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
    <div class="llm_list w-[480px] space-y-4">
      <For each={state().providers}>
        {(provider) => (
          <div class="">
            <div class="llm_header flex items-center justify-between">
              <div class="llm_title flex items-center">
                <img class="w-10 h-10" src={provider.logo_uri} />
                <h2 class="text-lg font-medium text-gray-900">{provider.name}</h2>
              </div>
              <input
                type="checkbox"
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
                <div>
                  <div>
                    <div>API代理地址</div>
                    <input
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
                  <div>
                    <div>API密钥</div>
                    <input
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
                <For each={provider.models}>
                  {(model) => (
                    <div class="flex items-center gap-4">
                      <div class="text-gray-900">{model.name}</div>
                      <div class="flex items-center gap-2">
                        <Show when={!model.buildin}>
                          <div
                            onClick={() => {
                              $model.ui.$manager.deleteProviderModel({
                                provider_id: provider.id,
                                model_id: model.id,
                              });
                            }}
                          >
                            删除
                          </div>
                        </Show>
                        <input
                          type="checkbox"
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
                <div class="flex items-center gap-4">
                  <input
                    class="flex-1"
                    autocomplete="off"
                    autoCapitalize="off"
                    autocorrect="off"
                    //     value={state().pendingModel.id}
                    //     onChange={(event) => {
                    //       $page.ui.$manager.updatePendingModel({
                    //         id: event.target.value,
                    //       });
                    //     }}
                  />
                  <button
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
