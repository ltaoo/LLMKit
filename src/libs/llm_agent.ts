// import { LLMService } from "@/libs/llm_service.node";
import { base, Handler } from "./base";
import { LLMProviderStore } from "./llm_provider";
import { HttpClientCore } from "./http_client";
import { BizError } from "./biz_error";
import { Result } from "./result";
import { ObjectFieldCore } from "./form";
import { LLMService } from "./llm_service";

type LLMAgentCoreProps = {
  id: string;
  name: string;
  desc: string;
  prompt: string;
  memorize?: boolean;
  responseHandler?: (result: string) => Result<string>;
  builder?: (payload: any) => any;
};

export function LLMAgentCore(props: LLMAgentCoreProps) {
  let _id = props.id;
  let _name = props.name;
  let _desc = props.desc;
  let _prompt = props.prompt;
  let _builder = props.builder;
  let _responseHandler =
    props.responseHandler || LLMAgentCore.DefaultAgentResponseHandler;
  let _llm_payload = { ...LLMAgentCore.DefaultLLM };
  let _llm_service: LLMService | null = null;
  let _llm_store = LLMProviderStore({
    providers: [],
  });
  /** 是否记忆上下文 */
  let _memorize = props.memorize ?? true;
  let _messages: { role: string; content: string }[] = [
    {
      role: "system",
      content: props.prompt,
    },
  ];

  const _state = {
    get name() {
      return _name;
    },
    get desc() {
      return _desc;
    },
    get prompt() {
      return _prompt;
    },
    get llm() {
      return _llm_payload;
    },
    get messages() {
      return _messages;
    },
  };

  enum Events {
    LLMChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.LLMChange]: {
      provider_id: string;
      model_id: string;
    };
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get desc() {
      return _desc;
    },
    get prompt() {
      return _prompt;
    },
    get llm() {
      return _llm_payload;
    },
    setLLMStore(llm_store: LLMProviderStore) {
      _llm_store = llm_store;
    },
    setLLMService(llm_service: LLMService) {
      _llm_service = llm_service;
      const r = _llm_store.buildLLMServicePayload({
        provider_id: _llm_payload.provider_id,
        model_id: _llm_payload.model_id,
      });
      if (r.error) {
        console.error(r.error.message);
        bus.emit(Events.Error, r.error);
        return;
      }
      _llm_service.setPayload(r.data);
    },
    update(payload: {
      llm: {
        provider_id: string;
        model_id: string;
        extra: Record<string, any>;
      };
    }) {
      this.selectLLMModel(payload.llm, { silent: true });
      this.updateLLMConfigureValue(payload.llm.extra, { silent: true });
    },
    /** 选择指定 model */
    selectLLMModel(
      payload: { provider_id: string; model_id: string },
      options: { silent?: boolean } = {}
    ) {
      const r = _llm_store.buildLLMServicePayload(payload);
      if (r.error) {
        console.error(r.error.message);
        bus.emit(Events.Error, r.error);
        return r;
      }
      _llm_payload.provider_id = r.data.provider_id;
      _llm_payload.model_id = r.data.model_id;
      if (_llm_service) {
        _llm_service.setPayload(r.data);
      }
      return Result.Ok(r.data);
    },
    /** 配置 LLM 支持的额外配置项，比如 流式输出、上下文长度、温度等 */
    updateLLMConfigureValue(
      payload: Record<string, any>,
      options: { silent?: boolean } = {}
    ) {
      _llm_payload.extra = { ..._llm_payload.extra, ...payload };
      if (_llm_service) {
        _llm_service.updateExtra(_llm_payload.extra);
      }
    },
    /** 更新 LLM 服务配置 */
    setLLMServicePayload(
      payload: {
        provider_id: string;
        model_id: string;
        apiProxyAddress: string;
        apiKey: string;
        extra: Record<string, any>;
      },
      options: { silent?: boolean } = {}
    ) {
      if (!_llm_service) {
        throw new BizError("请先设置 LLM 服务");
      }
      _llm_service.setPayload({
        provider_id: payload.provider_id,
        apiProxyAddress: payload.apiProxyAddress,
        apiKey: payload.apiKey,
        model_id: payload.model_id,
        extra: payload.extra,
      });
    },
    setMessages(messages: { role: string; content: string }[]) {
      _messages = messages;
    },
    appendMessages(text: string) {
      _messages.push({ role: "user", content: text });
      return _messages;
    },
    /** 调用 LLM 并返回结果 */
    async request(content: string) {
      if (!_llm_service) {
        return Result.Err("请先设置 LLM 服务");
      }
      const messages = (() => {
        if (_memorize) {
          return this.appendMessages(content);
        }
        return [
          { role: "system", content: _prompt },
          { role: "user", content },
        ];
      })();
      const r = await _llm_service.request(messages);
      if (r.error) {
        return Result.Err(r.error);
      }
      const r2 = _responseHandler(r.data);
      if (r2.error) {
        return Result.Err(r2.error);
      }
      const payload = _builder ? _builder(r2.data) : r2.data;
      return Result.Ok(payload);
    },
    toJSON() {
      return {
        id: _id,
        name: _name,
        desc: _desc,
        prompt: _prompt,
        llm: _llm_payload,
      };
    },
    destroy() {
      bus.destroy();
    },
    /** 监听 LLM 改变，包括切换了不同的模型、设置额外参数等等 */
    onLLMChange(handler: Handler<TheTypesOfEvents[Events.LLMChange]>) {
      return bus.on(Events.LLMChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

LLMAgentCore.DefaultPayload = {
  name: "",
  desc: "",
  prompt: "",
};
LLMAgentCore.DefaultLLM = {
  provider_id: "deepseek",
  model_id: "deepseek-chat",
  extra: {},
};
LLMAgentCore.SetDefaultLLM = (llm: {
  provider_id: string;
  model_id: string;
  extra: Record<string, any>;
}) => {
  LLMAgentCore.DefaultLLM = llm;
};
LLMAgentCore.DefaultAgentResponseHandler = (text: string) => {
  return Result.Ok(text);
};
LLMAgentCore.SetDefaultAgentResponseHandler = (
  handler: (text: string) => Result<string>
) => {
  LLMAgentCore.DefaultAgentResponseHandler = handler;
};

export type LLMAgentCore = ReturnType<typeof LLMAgentCore>;

type LLMAgentEditorCoreProps = {
  llm: LLMProviderStore;
};
export function LLMAgentEditorCore(props: LLMAgentEditorCoreProps) {
  let _id = "";
  let _name = "";
  let _desc = "";
  let _prompt = "";
  let _agent: LLMAgentCore | null = null;
  let _manager: LLMProviderStore = props.llm;
  let _provider_configure: ObjectFieldCore<any> = (() => {
    // console.log("[STORE] _provider_configure", _agent, _manager.providers);
    const provider = _manager.providers[0];
    return provider.configure;
  })();

  _provider_configure.onChange((value) => {
    if (!_agent) {
      return;
    }
    _agent.updateLLMConfigureValue(value);
  });

  const _state = {
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get desc() {
      return _desc;
    },
    get prompt() {
      return _prompt;
    },
    get provider_id() {
      return this.llm.provider_id;
    },
    get model_id() {
      return this.llm.model_id;
    },
    get llm() {
      if (!_agent || !_manager) {
        return {
          provider_id: "",
          model_id: "",
          extra: {},
        };
      }
      return {
        provider_id: _agent.llm.provider_id,
        model_id: _agent.llm.model_id,
        extra: _provider_configure.toJSON(),
      };
    },
    get provider_configure() {
      return _provider_configure;
    },
  };
  enum Events {
    Change,
    Error,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: {
      id: string;
      llm: {
        provider_id: string | null;
        model_id: string | null;
        extra: Record<string, any>;
      };
    };
    [Events.Error]: BizError;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get desc() {
      return _desc;
    },
    get prompt() {
      return _prompt;
    },
    findAgentById(id: string): Result<LLMAgentCore> {
      return Result.Err("请实现 findAgentById");
    },
    updateName(name: string) {
      _name = name;
    },
    updateDesc(desc: string) {
      _desc = desc;
    },
    updatePrompt(prompt: string) {
      _prompt = prompt;
    },
    selectAgent(agent: LLMAgentCore) {
      const prev_agent_llm = _agent ? { ..._agent.llm } : null;

      _id = agent.id;
      _name = agent.name;
      _desc = agent.desc;
      _prompt = agent.prompt;
      _agent = agent;

      const extra = { ...agent.llm.extra };
      const existing = _manager.findProvider(agent.llm.provider_id, {
        enabled: true,
      });
      const llm = (() => {
        if (existing) {
          return agent.llm;
        }
        const enabledProvider = _manager.firstEnabledProvider;
        if (enabledProvider === null) {
          return null;
        }
        return {
          provider_id: enabledProvider.id,
          model_id: enabledProvider.models[0].id,
        };
      })();
      if (llm === null) {
        bus.emit(Events.Error, new BizError("没有可用的 provider"));
        return;
      }
      console.log(
        "[STORE] selectAgent",
        existing,
        prev_agent_llm?.provider_id,
        llm.provider_id
      );
      this.selectProviderModel(llm, { silent: !!existing });
      if (
        !prev_agent_llm ||
        (prev_agent_llm && prev_agent_llm.provider_id !== llm.provider_id)
      ) {
        console.log("[STORE] selectAgent need update configure");
        _provider_configure.destroy();
        let provider = _manager.findProvider(llm.provider_id, {
          enabled: true,
        });
        if (provider) {
          _provider_configure = provider.configure;
          _provider_configure.onChange((value) => {
            console.log(
              "[STORE]agents - selectProviderModel - _provider_configure.onChange",
              value,
              !!_agent
            );
            if (!_agent) {
              bus.emit(Events.Error, new BizError("找不到对应的 agent"));
              return;
            }
            _agent.updateLLMConfigureValue(value);
            bus.emit(Events.Change, this.toJSON());
          });
        }
      }
      _provider_configure.setValue(extra);
      bus.emit(Events.StateChange, { ..._state });
    },
    selectProviderModel(
      payload: { provider_id: string; model_id: string },
      options: { silent?: boolean } = {}
    ) {
      console.log("[LLMSDK]llm_agent - selectProviderModel", payload);
      if (!_agent || !_manager) {
        console.error("[STORE] 找不到对应的 agent 或 manager");
        bus.emit(Events.Error, new BizError("找不到对应的 agent 或 manager"));
        return;
      }
      const prev_provider_id = _agent.llm.provider_id;
      const r = _agent.selectLLMModel(payload);
      if (r.error) {
        console.error("[STORE] selectProviderModel failed", r.error);
        bus.emit(Events.Error, r.error);
        return;
      }
      if (payload.provider_id !== prev_provider_id) {
        console.log(
          "[STORE] selectProviderModel need update LLM configure form"
        );
        const provider = _manager.providers.find(
          (p) => p.id === payload.provider_id
        );
        if (provider) {
          _provider_configure.destroy();
          _provider_configure = provider.configure;
          // _provider_configure.setValue(_agent.llm.extra);
          _provider_configure.onChange((value) => {
            console.log(
              "[STORE]agents - selectProviderModel - _provider_configure.onChange",
              value,
              !!_agent
            );
            if (!_agent) {
              bus.emit(Events.Error, new BizError("找不到对应的 agent"));
              return;
            }
            _agent.updateLLMConfigureValue(value);
            bus.emit(Events.Change, this.toJSON());
          });
        }
      }
      _agent.selectLLMModel(payload);
      if (!options.silent) {
        bus.emit(Events.Change, this.toJSON());
        bus.emit(Events.StateChange, { ..._state });
      }
    },
    selectProviderModelForAgent(
      payload: {
        agent_id: string;
        provider_id: string;
        model_id: string;
      },
      options: { silent?: boolean } = {}
    ) {
      const r = this.findAgentById(payload.agent_id);
      if (r.error) {
        console.error(r.error.message);
        bus.emit(Events.Error, r.error);
        return;
      }
      _agent = r.data;
      this.selectProviderModel(
        {
          provider_id: payload.provider_id,
          model_id: payload.model_id,
        },
        options
      );
    },
    toJSON() {
      return {
        id: _agent ? _agent.id : _id,
        llm: {
          provider_id: _agent ? _agent.llm.provider_id : null,
          model_id: _agent ? _agent.llm.model_id : null,
          extra: _provider_configure.toJSON(),
        },
      };
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

type LLMAgentStoreProps = {
  agents: LLMAgentCore[];
  llm_store: LLMProviderStore;
  client: HttpClientCore;
  llm_service: LLMService;
};
export function LLMAgentStore(props: LLMAgentStoreProps) {
  let _agents = props.agents;
  let _client = props.client;
  let _llm_service = props.llm_service;
  let _editor = LLMAgentEditorCore({ llm: props.llm_store });

  for (let i = 0; i < _agents.length; i += 1) {
    _agents[i].setLLMStore(props.llm_store);
    _agents[i].setLLMService(props.llm_service);
  }
  _editor.findAgentById = (id: string) => {
    const agent = _agents.find((agent) => agent.id === id);
    if (!agent) {
      return Result.Err("找不到对应的 agent");
    }
    return Result.Ok(agent);
  };
  _editor.onChange((payload) => {
    bus.emit(Events.AgentChange, payload);
  });
  _editor.onStateChange(() => {
    bus.emit(Events.StateChange, { ..._state });
  });

  const _state = {
    agents: _agents.map((agent) => {
      return {
        id: agent.id,
        name: agent.name,
        desc: agent.desc,
        prompt: agent.prompt,
        llm: agent.llm,
      };
    }),
    current_agent: LLMAgentCore.DefaultPayload,
  };
  enum Events {
    AgentChange,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.AgentChange]: {
      id: string;
      llm: {
        provider_id: string | null;
        model_id: string | null;
        extra: Record<string, any>;
      };
    };
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    symbol: "AgentStore" as const,
    state: _state,
    $editor: _editor,
    get agents() {
      return _agents;
    },
    findAgentById(id: string) {
      return _agents.find((agent) => agent.id === id);
    },
    patch(
      agents: Record<
        string,
        {
          id: string;
          llm: {
            provider_id: string;
            model_id: string;
            extra: Record<string, any>;
          };
        }
      >
    ) {
      for (let i = 0; i < _agents.length; i += 1) {
        const agent = _agents[i];
        const config = agents[agent.id];
        if (config) {
          agent.update({
            llm: config.llm,
          });
          // _editor.setConfigureValue(config.llm.extra);
        }
      }
    },
    selectAgent(payload: { id: string }) {
      const agent = _agents.find((a) => a.id === payload.id);
      if (!agent) {
        return;
      }
      this.$editor.selectAgent(agent);
    },
    onAgentChange(handler: Handler<TheTypesOfEvents[Events.AgentChange]>) {
      return bus.on(Events.AgentChange, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type LLMAgentStore = ReturnType<typeof LLMAgentStore>;
