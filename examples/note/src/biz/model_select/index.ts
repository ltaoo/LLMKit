import { base, Handler } from "@/domains/base";

type ModelProvider = {
  id: string;
  name: string;
  icon: string;
  models: {
    id: string;
    name: string;
  }[];
  /** 表单项 */
  inputs: {
    label: string;
    description: string;
    tip: string;
    type: string;
  }[];
};
type ModelSelectCoreProps = {};
const DefaultProviderValue = {
  enabled: true,
  models: [],
  values: {},
};

export function ModelSelectCore(props: ModelSelectCoreProps) {
  let _providers: ModelProvider[] = [];
  let _values: Record<
    string,
    {
      /** 是否启用 */
      enabled: boolean;
      /** 启用的模型列表 */
      models: string[];
      /** ModelProvider.inputs 对应的输入值 */
      values: Record<string, string | number | boolean>;
    }
  > = {};

  const _state = {};
  const _methods = {
    /** 设置厂商列表 */
    setProviders(value: ModelProvider[]) {
      _providers = value;
    },
    /** 启用指定厂商 */
    enableProvider(provider_id: string) {
      _values[provider_id] = _values[provider_id] || { ...DefaultProviderValue };
      _values[provider_id].enabled = true;
    },
    disableProvider(provider_id: string) {
      _values[provider_id] = _values[provider_id] || { ...DefaultProviderValue };
      _values[provider_id].enabled = false;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  const result = {
    state: _state,
    methods: _methods,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };

  return result;
}

export type ModelSelectCore = ReturnType<typeof ModelSelectCore>;
