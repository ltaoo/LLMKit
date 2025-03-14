import { base, Handler } from "./base";
import { Result } from "./result";
import { ObjectFieldCore } from "./form";

/**
 * @file 管理 LLM 厂商及配置信息
 */
type LLMProviderModelValueProps = {
  id: string;
  name: string;
  enabled: boolean;
  buildin: boolean;
};
/** LLM 厂商模型值 */
export function LLMProviderModelValue(props: LLMProviderModelValueProps) {
  let _id = props.id;
  let _name = props.name;
  let _enabled = props.enabled;
  let _buildin = props.buildin;

  return {
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get enabled() {
      return _enabled;
    },
    get buildin() {
      return _buildin;
    },
    toggle(value: boolean) {
      _enabled = value;
    },
    setEnabled(value: boolean) {
      _enabled = value;
    },
    toJSON() {
      return {
        id: _id,
        enabled: _enabled,
        buildin: _buildin,
      };
    },
  };
}
export type LLMProviderModelValue = ReturnType<typeof LLMProviderModelValue>;

type LLMProviderValueProps = {
  id: string;
  enabled: boolean;
  apiProxyAddress?: string;
  apiKey: string;
  models: LLMProviderModelValue[];
};
export function LLMProviderValue(props: LLMProviderValueProps) {
  let _id = props.id;
  let _enabled = props.enabled;
  let _apiProxyAddress = props.apiProxyAddress;
  let _apiKey = props.apiKey;
  let _models = props.models;
  let _extra = {};

  return {
    symbol: "LLMProviderValue" as const,
    get id() {
      return _id;
    },
    get enabled() {
      return _enabled;
    },
    get apiProxyAddress() {
      return _apiProxyAddress;
    },
    get apiKey() {
      return _apiKey;
    },
    get models() {
      return _models;
    },
    get extra() {
      return _extra;
    },
    updateEnabled(enabled: boolean): void {
      _enabled = enabled;
    },
    updateApiProxyAddress(apiProxyAddress: string): void {
      _apiProxyAddress = apiProxyAddress;
    },
    updateApiKey(apiKey: string): void {
      _apiKey = apiKey;
    },
    setModels(models: LLMProviderModelValue[]): void {
      _models = models;
    },
    updateExtra(extra: Record<string, any>): void {
      _extra = extra;
    },
    appendExtra(extra: Record<string, any>): void {
      _extra = { ..._extra, ...extra };
    },
    toJSON() {
      return {
        id: _id,
        enabled: _enabled,
        apiProxyAddress: _apiProxyAddress,
        apiKey: _apiKey,
        models: _models.map((m) => m.toJSON()),
      };
    },
  };
}
export type LLMProviderValue = ReturnType<typeof LLMProviderValue>;

type LLMProviderModelCoreProps = {
  id: string;
  name: string;
  desc: string;
  tags: string[];
};
export function LLMProviderModelCore(props: LLMProviderModelCoreProps) {
  let _id = props.id;
  let _name = props.name;
  let _desc = props.desc;
  let _tags = props.tags;

  return {
    symbol: "LLMProviderModelCore" as const,
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get desc() {
      return _desc;
    },
    get tags() {
      return _tags;
    },
  };
}
export type LLMProviderModelCore = ReturnType<typeof LLMProviderModelCore>;

// Main LLMProvider function/component
type LLMProviderCoreProps = {
  id: string;
  name: string;
  logo_uri: string;
  apiProxyAddress: string;
  apiKey: string;
  models: LLMProviderModelCore[];
  // 支持的配置项
  configure: ObjectFieldCore<any>;
};
export function LLMProviderCore(props: LLMProviderCoreProps) {
  let _id = props.id;
  let _name = props.name;
  let _logo_uri = props.logo_uri;
  let _apiProxyAddress = props.apiProxyAddress;
  let _apiKey = props.apiKey;
  let _models = props.models;
  let _configure = props.configure;

  return {
    symbol: "LLMProviderCore" as const,
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get logo_uri() {
      return _logo_uri;
    },
    get apiProxyAddress() {
      return _apiProxyAddress;
    },
    get apiKey() {
      return _apiKey;
    },
    get models() {
      return _models;
    },
    get configure() {
      return _configure;
    },
  };
}
export type LLMProviderCore = ReturnType<typeof LLMProviderCore>;

type LLMProviderControllerCoreProps = {
  provider: LLMProviderCore;
  value: LLMProviderValue;
};

/**
 * 实际在页面上使用的，用来配置 LLM 厂商的实现
 */
export function LLMProviderControllerCore(
  props: LLMProviderControllerCoreProps
) {
  let _provider = props.provider;
  let _value = props.value;

  return {
    symbol: "LLMProviderControllerCore" as const,
    get id() {
      return _value.id;
    },
    get name() {
      return _provider.name;
    },
    get logo_uri() {
      return _provider.logo_uri;
    },
    get placeholder() {
      return _provider.apiProxyAddress;
    },
    get provider() {
      return _provider;
    },
    get value() {
      return _value;
    },
    get enabled() {
      return _value.enabled;
    },
    get models() {
      return [];
      // const buildin_models = _provider.models.map((m) => {
      //   return LLMProviderModelValue({
      //     id: m.id,
      //     name: m.name,
      //     enabled: _value.models1.find((m) => m.id === m.id)?.enabled ?? false,
      //     buildin: true,
      //   });
      // });
      // const custom_models = _value.models2.map((m) => {
      //   return LLMProviderModelValue({
      //     id: m.id,
      //     name: m.name,
      //     enabled: m.enabled,
      //     buildin: false,
      //   });
      // });
      // return [...buildin_models, ...custom_models];
    },
    updateEnabled(enabled: boolean) {
      _value.updateEnabled(enabled);
    },
  };
}
export type LLMProviderControllerCore = ReturnType<
  typeof LLMProviderControllerCore
>;

type LLMProviderStoreProps = {
  providers: LLMProviderCore[];
};
export function LLMProviderStore(props: LLMProviderStoreProps) {
  const _providers = props.providers;
  let _values: Record<string, LLMProviderValue> = {};
  let _pendingProviders: Record<
    string,
    {
      model_id: string;
    }
  > = {};
  function isDefaultEnabled(id: string) {
    return ["openai", "deepseek"].includes(id);
  }
  function updateValues() {
    _values = _providers
      .map((p) => {
        return {
          [p.id]: LLMProviderValue({
            id: p.id,
            apiProxyAddress: "",
            apiKey: "",
            enabled: isDefaultEnabled(p.id),
            models: [
              ...p.models.map((m) => {
                return LLMProviderModelValue({
                  id: m.id,
                  name: m.name,
                  enabled: isDefaultEnabled(p.id),
                  buildin: true,
                });
              }),
            ],
          }),
        };
      })
      .reduce((a, b) => {
        return { ...a, ...b };
      }, {});
  }

  updateValues();

  const _state = {
    get providers() {
      return _providers.map((provider) => {
        const value = _values[provider.id];
        return {
          id: provider.id,
          name: provider.name,
          logo_uri: provider.logo_uri,
          placeholder: provider.apiProxyAddress,
          enabled: value.enabled,
          apiProxyAddress: value.apiProxyAddress,
          apiKey: value.apiKey,
          models: value.models.map((m) => ({
            id: m.id,
            name: m.name,
            enabled: m.enabled,
            buildin: m.buildin,
          })),
        };
      });
    },
    get enabledProviders() {
      return _providers
        .filter((p) => {
          const value = _values[p.id];
          return value.enabled;
        })
        .map((p) => {
          const value = _values[p.id];
          return {
            id: p.id,
            name: p.name,
            logo_uri: p.logo_uri,
            models: value.models
              .filter((m) => {
                return m.enabled;
              })
              .map((m) => {
                return { id: m.id, name: m.name };
              }),
          };
        });
    },
    get pendingProviders() {
      return _pendingProviders;
    },
    get JSON() {
      return _providers.map((provider) => {
        const value = _values[provider.id];
        return {
          id: provider.id,
          enabled: value.enabled,
          apiProxyAddress: value.apiProxyAddress || null,
          apiKey: value.apiKey || null,
          models: value.models.map((m) => ({ id: m.id, enabled: m.enabled })),
        };
      });
    },
  };
  enum Events {
    StateChange,
    ProviderChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.ProviderChange]: {
      id: string;
      enabled: boolean;
      apiProxyAddress?: string;
      apiKey?: string;
      models: {
        id: string;
        enabled: boolean;
      }[];
    };
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get providers() {
      return _providers;
    },
    get firstEnabledProvider() {
      const r = _providers.find((p) => {
        const value = _values[p.id];
        return value.enabled;
      });
      if (r) {
        return r;
      }
      return null;
    },
    findValueOfProvider(provider_id: string) {
      return _values[provider_id];
    },
    findProvider(provider_id: string, condition: { enabled: boolean }) {
      if (condition.enabled === true) {
        return _providers.find((p) => {
          const value = _values[p.id];
          return value.enabled && p.id === provider_id;
        });
      }
      return _providers.find((p) => p.id === provider_id);
    },
    /** 使用外部数据更新 state */
    patch(
      values: Record<
        string,
        {
          id: string;
          enabled: boolean;
          apiProxyAddress?: string;
          apiKey?: string;
          models: { id: string; enabled: boolean; buildin: boolean }[];
        }
      >
    ) {
      const ids = Object.keys(values);
      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i];
        const payload = values[id];
        const provider = _providers.find((p) => p.id === id);
        if (!provider) {
          continue;
        }
        const value = _values[id];
        value.updateEnabled(payload.enabled);
        if (payload.apiProxyAddress) {
          value.updateApiProxyAddress(payload.apiProxyAddress);
        }
        if (payload.apiKey) {
          value.updateApiKey(payload.apiKey);
        }
        const modelMapWithName: Record<string, string> = provider.models.reduce(
          (a, b) => {
            return {
              ...a,
              [b.id]: b.name,
            };
          },
          {}
        );
        value.setModels(
          payload.models.map((m) => {
            return LLMProviderModelValue({
              id: m.id,
              name: modelMapWithName[m.id] || m.id,
              enabled: m.enabled,
              buildin: m.buildin,
            });
          })
        );
      }
      bus.emit(Events.StateChange, { ..._state });
    },
    updateProviderApiProxyAddress(payload: {
      provider_id: string;
      apiProxyAddress: string;
    }) {
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      value.updateApiProxyAddress(payload.apiProxyAddress);
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    updateProviderApiKey(payload: { provider_id: string; apiKey: string }) {
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      value.updateApiKey(payload.apiKey);
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    toggleProviderEnabled(payload: { provider_id: string; enabled: boolean }) {
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      value.updateEnabled(payload.enabled);
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    toggleModelEnabled(payload: {
      provider_id: string;
      model_id: string;
      enabled: boolean;
    }) {
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      const model = value.models.find((m) => m.id === payload.model_id);
      if (!model) {
        return;
      }
      model.toggle(payload.enabled);
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    updatePendingModel(payload: { provider_id: string; id: string }) {
      _pendingProviders[payload.provider_id] = {
        model_id: payload.id,
      };
      bus.emit(Events.StateChange, { ..._state });
    },
    addPendingModel(payload: { provider_id: string; model_id?: string }) {
      console.log("[BIZ]llm_provider - addPendingModel", payload);
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      const model_id =
        payload.model_id || _pendingProviders[payload.provider_id].model_id;
      value.models.push(
        LLMProviderModelValue({
          id: model_id,
          name: model_id,
          enabled: true,
          buildin: false,
        })
      );
      _pendingProviders = {};
      // _pendingModel = { id: "" };
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    deleteProviderModel(payload: { provider_id: string; model_id: string }) {
      const value = _values[payload.provider_id];
      if (!value) {
        return;
      }
      value.setModels(value.models.filter((m) => m.id !== payload.model_id));
      bus.emit(Events.ProviderChange, value.toJSON());
      bus.emit(Events.StateChange, { ..._state });
    },
    /** 根据 provider_id 和 model_id 构建 LLM 服务所需的 payload */
    buildLLMServicePayload(payload: { provider_id: string; model_id: string }) {
      // console.log("[BIZ]llm_provider - buildLLMServicePayload", payload, _providers, _values);
      const provider = _providers.find((p) => p.id === payload.provider_id);
      if (!provider) {
        return Result.Err(`找不到对应的 LLM 提供商: ${payload.provider_id}`);
      }
      // const model = provider.models.find((m) => m.id === payload.model_id);
      // if (!model) {
      //   return Result.Err("找不到对应的 LLM 模型");
      // }
      const value = _values[provider.id];
      if (!value) {
        return Result.Err(`找不到对应的 LLM 表单值: ${provider.id}`);
      }
      return Result.Ok({
        provider_id: provider.id,
        model_id: payload.model_id,
        apiProxyAddress: value.apiProxyAddress || provider.apiProxyAddress,
        apiKey: value.apiKey,
        extra: value.extra,
      });
    },
    destroy() {
      bus.destroy();
    },
    onProviderChange(
      handler: Handler<TheTypesOfEvents[Events.ProviderChange]>
    ) {
      return bus.on(Events.ProviderChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type LLMProviderStore = ReturnType<typeof LLMProviderStore>;
