// import { LLMService } from "@/libs/llm_service.node";
import { base, Handler } from "./base";
import { LLMProviderStore } from "./llm_provider";
import { HttpClientCore } from "./http_client";
import { BizError } from "./biz_error";
import { Result } from "./result";
import { ObjectFieldCore } from "./form";
import { LLMService } from "./llm_service";

enum LLMAgentType {
  Chat,
}

type LLMAgentCoreProps = {
  id: number;
  name: string;
  desc?: string;
  prompt: string;
  config?: {
    memorize?: boolean;
  };
  builtin?: boolean;
  llm_config?: {
    provider_id: string;
    model_id: string;
    extra: Record<string, any>;
  };
  responseHandler?: (result: string) => Result<string>;
  builder?: (payload: any) => any;
};

export function LLMAgentCore(props: LLMAgentCoreProps) {
  let _id = props.id;
  let _name = props.name;
  let _desc = props.desc ?? "";
  let _prompt = props.prompt;
  let _builtin = props.builtin ?? false;
  let _builder = props.builder;
  let _responseHandler =
    props.responseHandler || LLMAgentCore.DefaultAgentResponseHandler;
  let _llm_payload = props.llm_config
    ? { ...props.llm_config }
    : { ...LLMAgentCore.DefaultLLM };
  let _type = LLMAgentType.Chat;
  let _llm_service: LLMService | null = null;
  let _llm_store = LLMProviderStore({
    providers: [],
  });
  /** 是否记忆上下文 */
  let _memorize = props.config?.memorize ?? true;
  let _messages: { role: string; content: string }[] = [
    {
      role: "system",
      content: props.prompt,
    },
  ];
  let _loading = false;

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
    get loading() {
      return _loading;
    },
  };

  enum Events {
    LLMChange,
    Error,
    BeforeRequest,
    RequestCompleted,
    RequestFailed,
    RequestSuccess,
  }
  type TheTypesOfEvents = {
    [Events.LLMChange]: {
      provider_id: string;
      model_id: string;
    };
    [Events.Error]: BizError;
    [Events.BeforeRequest]: void;
    [Events.RequestCompleted]: void;
    [Events.RequestFailed]: void;
    [Events.RequestSuccess]: void;
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
    set name(name: string) {
      _name = name;
    },
    get desc() {
      return _desc;
    },
    set desc(desc: string) {
      _desc = desc;
    },
    get prompt() {
      return _prompt;
    },
    set prompt(prompt: string) {
      _prompt = prompt;
    },
    get llm() {
      return _llm_payload;
    },
    get builtin() {
      return _builtin;
    },
    setLLMStore(llm_store: LLMProviderStore) {
      _llm_store = llm_store;
    },
    setLLMService(llm_service: LLMService) {
      _llm_service = llm_service;
    },
    updateLLM(payload: {
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
      console.log("[LLMSDK]llm_agent - selectLLMModel", _name, r.data);
      _llm_payload.provider_id = r.data.provider_id;
      _llm_payload.model_id = r.data.model_id;
      return Result.Ok(r.data);
    },
    /** 配置 LLM 支持的额外配置项，比如 流式输出、上下文长度、温度等 */
    updateLLMConfigureValue(
      payload: Record<string, any>,
      options: { silent?: boolean } = {}
    ) {
      _llm_payload.extra = { ..._llm_payload.extra, ...payload };
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
        const err = new BizError("请先设置 LLM 服务");
        console.error(err.message);
        bus.emit(Events.Error, err);
        return;
      }
      _llm_service.setPayload(
        {
          provider_id: payload.provider_id,
          apiProxyAddress: payload.apiProxyAddress,
          apiKey: payload.apiKey,
          model_id: payload.model_id,
          extra: payload.extra,
        },
        { name: _name }
      );
    },
    debugLLMServicePayload() {
      if (!_llm_service) {
        return;
      }
      console.log(
        "[LLMSDK]llm_agent - debugLLMServicePayload",
        _name,
        _llm_payload
      );
    },
    setMemorize(memorize: boolean) {
      _memorize = memorize;
    },
    setMessages(messages: { role: string; content: string }[]) {
      _messages = messages;
    },
    appendMessages(text: string) {
      _messages.push({ role: "user", content: text });
      return _messages;
    },
    updateLLMServicePayload() {
      if (!_llm_service) {
        return Result.Err("请先设置 LLM 服务");
      }
      const r = _llm_store.buildLLMServicePayload({
        provider_id: _llm_payload.provider_id,
        model_id: _llm_payload.model_id,
      });
      if (r.error) {
        return r;
      }
      _llm_service.setPayload(r.data);
      return Result.Ok(null);
    },
    /** 调用 LLM 并返回结果 */
    async request<T extends any>(content: string) {
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
      const r1 = this.updateLLMServicePayload();
      if (r1.error) {
        return r1;
      }
      _loading = true;
      bus.emit(Events.BeforeRequest);
      const r = await _llm_service.request(messages, {
        name: _name,
        payload: _llm_service.payload,
      });
      _loading = false;
      bus.emit(Events.RequestCompleted);
      if (r.error) {
        bus.emit(Events.RequestFailed);
        return Result.Err(r.error);
      }
      bus.emit(Events.RequestSuccess);
      _messages.push({ role: "assistant", content: r.data });
      const r2 = _responseHandler(r.data);
      if (r2.error) {
        return Result.Err(r2.error);
      }
      const payload = _builder ? _builder(r2.data) : r2.data;
      return Result.Ok(payload as T);
    },
    toJSON() {
      return {
        id: _id,
        name: _name,
        desc: _desc,
        prompt: _prompt,
        type: _type,
        builtin: _builtin,
        config: {
          memorize: _memorize,
        },
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
  extra: {} as Record<string, any>,
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
  agent: LLMAgentStore;
};
export function LLMAgentEditorCore(props: LLMAgentEditorCoreProps) {
  let _id = 0;
  let _name = "";
  let _desc = "";
  let _prompt = "";
  let _agent: LLMAgentCore | null = null;
  let _llm_store: LLMProviderStore = props.llm;
  let _agent_store: LLMAgentStore = props.agent;
  let _provider_configure: ObjectFieldCore<any> = (() => {
    // console.log("[STORE] _provider_configure", _agent, _manager.providers);
    const provider = _llm_store.providers[0];
    if (provider) {
      return provider.configure;
    }
    return new ObjectFieldCore({
      label: "配置",
      name: "configure",
      fields: {},
    });
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
      if (!_agent) {
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
    get builtin() {
      return _agent?.builtin ?? false;
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
      id: number;
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
    get providerConfigure() {
      return _provider_configure;
    },
    get agent() {
      return _agent;
    },
    updateName(name: string) {
      _name = name;
      if (_agent) {
        _agent.name = name;
      }
    },
    updateDesc(desc: string) {
      _desc = desc;
      if (_agent) {
        _agent.desc = desc;
      }
    },
    updatePrompt(prompt: string) {
      _prompt = prompt;
      if (_agent) {
        _agent.prompt = prompt;
      }
    },
    setAgentStore(agent_store: LLMAgentStore) {
      _agent_store = agent_store;
    },
    get isCreateAgent() {
      return _agent?.id === 0;
    },
    startCreateAgent() {
      _id = 0;
      _name = "";
      _desc = "";
      _prompt = "";
      _agent = LLMAgentCore({
        id: 0,
        name: "",
        desc: "",
        prompt: "",
        builtin: false,
        llm_config: LLMAgentCore.DefaultLLM,
      });
      _agent_store.attachLLMServiceAndOther([_agent]);
      _provider_configure.clear();
      // console.log("[STORE] startCreateAgent", _agent.llm);
      bus.emit(Events.StateChange, { ..._state });
    },
    selectAgent(agent: LLMAgentCore) {
      const prev_agent_llm = _agent ? { ..._agent.llm } : null;

      _id = agent.id;
      _name = agent.name;
      _desc = agent.desc ?? "";
      _prompt = agent.prompt;
      _agent = agent;

      const extra = { ...agent.llm.extra };
      const existing = _llm_store.findProviderById(agent.llm.provider_id, {
        enabled: true,
      });
      const llm = (() => {
        if (existing) {
          return agent.llm;
        }
        const enabledProvider = _llm_store.firstEnabledProvider;
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
        let provider = _llm_store.findProviderById(llm.provider_id, {
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
      console.log(
        "[LLMSDK]llm_agent - selectProviderModel",
        payload,
        _agent,
        _llm_store
      );
      if (!_agent || !_llm_store) {
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
        const provider = _llm_store.providers.find(
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
      // console.log("[LLMSDK]llm_agent - selectProviderModel - _agent.selectLLMModel", options.silent);
      if (!options.silent) {
        bus.emit(Events.Change, this.toJSON());
        bus.emit(Events.StateChange, { ..._state });
      }
    },
    async selectProviderModelForAgent(
      payload: {
        agent_id: number;
        provider_id: string;
        model_id: string;
      },
      options: { silent?: boolean } = {}
    ) {
      if (!_agent_store) {
        bus.emit(Events.Error, new BizError("找不到对应的 agent"));
        return;
      }
      const r = await _agent_store.findAgentById(payload.agent_id);
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
        name: _agent ? _agent.name : _name,
        desc: _agent ? _agent.desc : _desc,
        prompt: _agent ? _agent.prompt : _prompt,
        llm: {
          provider_id: _agent ? _agent.llm.provider_id : null,
          model_id: _agent ? _agent.llm.model_id : null,
          extra: _provider_configure.toJSON(),
        },
      };
    },
    onAgentChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
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
  /** 每个 agent 维护自己的 service，因为 service 的请求参数是不同的，不能所有 agent 共用一个 service */
  llm_service: LLMService;
};
export function LLMAgentStore(props: LLMAgentStoreProps) {
  const _internal = {
    agents: [...props.agents],
  };

  function attachLLMServiceAndOther(agents: LLMAgentCore[]) {
    for (let i = 0; i < agents.length; i += 1) {
      agents[i].setLLMStore(props.llm_store);
      agents[i].setLLMService(props.llm_service);
    }
  }
  attachLLMServiceAndOther(_internal.agents);

  const _state = {
    get agents() {
      return _internal.agents.map((agent) => {
        return {
          id: agent.id,
          name: agent.name,
          desc: agent.desc,
          prompt: agent.prompt,
          builtin: agent.builtin,
          llm: agent.llm,
        };
      });
    },
    get current_agent() {
      return { ...LLMAgentCore.DefaultPayload };
    },
  };
  enum Events {
    AgentChange,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.AgentChange]: {
      id: number;
      llm: {
        provider_id: string | null;
        model_id: string | null;
        extra: Record<string, any>;
      };
    };
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  const _store = {
    symbol: "AgentStore" as const,
    state: _state,
    get agents() {
      return _internal.agents;
    },
    findAgentById(id: number): Promise<Result<LLMAgentCore>> {
      return Promise.resolve(Result.Err("请实现 findAgentById"));
    },
    findAgentByName(name: string): Promise<Result<LLMAgentCore>> {
      return Promise.resolve(Result.Err("请实现 findAgentByName"));
    },
    buildFromOuter(data: any): Result<LLMAgentCore> {
      return Result.Err("请实现 buildFromOuter");
    },
    patch(
      agents: Record<
        string,
        {
          id: number;
          llm: {
            provider_id: string;
            model_id: string;
            extra: Record<string, any>;
          };
        }
      >
    ) {
      for (let i = 0; i < _internal.agents.length; i += 1) {
        const agent = _internal.agents[i];
        const config = agents[agent.id];
        if (config) {
          agent.updateLLM({
            llm: config.llm,
          });
          // _editor.setConfigureValue(config.llm.extra);
        }
      }
    },
    attachLLMServiceAndOther,
    setAgents(agents: LLMAgentCore[]) {
      this.attachLLMServiceAndOther(agents);
      _internal.agents = [...agents];
      bus.emit(Events.StateChange, { ..._state });
    },
    appendAgents(agents: LLMAgentCore[]) {
      this.attachLLMServiceAndOther(agents);
      _internal.agents = [..._internal.agents, ...agents];
      bus.emit(Events.StateChange, { ..._state });
    },
    removeAgents(ids: string[]) {
      _internal.agents = _internal.agents.filter((agent) => {
        return !ids.includes(String(agent.id));
      });
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
  return _store;
}

export type LLMAgentStore = ReturnType<typeof LLMAgentStore>;
