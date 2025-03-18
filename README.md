# LLMKit

LLMKit 可以帮助你快速搭建一个基于 LLM 的智能助手，框架、视图无关，可在 `React`、`Vue`、`tauri`、甚至小程序中使用。

核心实现

- LLMProviderStore，管理多个 LLM 提供商
- LLMAgentStore，管理多个 Agent
- LLMAgentCore，维护了 Agent 的配置，重点是 LLM 相关信息，包括 LLM 提供商、模型、配置项等

因为视图框架无关，所以定制样式也非常简单，可以很好地融入现有项目。

## 使用示例

### LLMProviderStore

```ts
export const llm_store = LLMProviderStore({
  providers: [
    LLMProviderCore({
      id: "openai",
      name: "OpenAI",
      logo_uri: "/provider_light_openai.png",
      apiProxyAddress: "https://api.openai.com",
      apiKey: "",
      models: [
        LLMProviderModelCore({
          id: "openai-gpt-4o-mini",
          name: "OpenAI GPT-4o Mini",
          desc: "",
          tags: [],
        }),
        LLMProviderModelCore({
          id: "openai-gpt-4o",
          name: "OpenAI GPT-4o",
          desc: "",
          tags: [],
        }),
      ],
    }),
  ],
});
```

在页面上渲染 `llm_store.state.providers`，可以对其进行配置，包括 `apiProxyAddress`、`apiKey`、`model` 等。

### LLMAgentStore

```ts
export const agent_store = AgentStore({
  agents: [
    AgentCore({
      id: "1",
      name: "纠错",
      desc: "可以对中文进行纠错",
      prompt:
        "你是一个中文纠错专家，请对以下中文进行纠错，并给出纠错后的结果。",
      client,
      responseHandler: DefaultAgentResponseHandler,
      builder: DefaultAgentBuilder,
    }),
  ],
});
```

在页面上渲染 `agent_store.state.agents`，可以对其进行配置，包括使用的 `LLM`，`LLM` 配置项等。

## 各个框架、端示例

目前演示了在 tauri、react、vue 中的使用，其他框架、端示例正在开发中。

### react 示例

核心逻辑在 examples/multiple-agent 目录下

![](./docs/llmkit_screenshot1.png)
![](./docs/llmkit_screenshot2.png)

对应代码 [examples/react/src/App.tsx](https://github.com/ltaoo/LLMKit/blob/master/examples/react/src/App.tsx)

## vue 示例

和 react 示例复用了同一代码，没有任何修改，即可直接在 vue 中使用。

截图和 react 示例相同，不再赘述。

对应代码 [examples/vue/src/App.vue](https://github.com/ltaoo/LLMKit/blob/master/examples/vue/src/App.vue)

### tauri + solidJS 示例

![](./docs/llmkit_example3.png)

该示例更加复杂，数据持久化在本地数据库

## 项目运行

项目 clone 到本地后

### 前端项目如 react、vue

启动一个终端用于运行后端代码

```bash
cd examples/backend
go run main.go
```

另外启动一个终端，用于运行各个前端框架代码

```bash
cd examples/react
npm install
npm run dev
```

在浏览器打开 http://localhost:5173 即可看到效果

vue 同理，进入 `examples/vue` 目录，运行 `npm install` 和 `npm run dev` 即可

### tauri 示例

进入 `examples/tauri` 目录，运行 `cargo tauri dev` 即可
