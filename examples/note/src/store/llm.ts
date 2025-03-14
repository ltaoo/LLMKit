import { LLMProviderCore, LLMProviderStore as LLMProviderStore, LLMProviderModelCore } from "@/biz/llm_provider";
import { CheckboxCore } from "@/domains/ui";
import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2/field";
import { InputCore } from "@/domains/ui/form/input";

import { storage } from "./storage";

export const LLMProviders = [
  LLMProviderCore({
    id: "deepseek",
    name: "DeepSeek",
    logo_uri: "/provider_dark_deepseek.png",
    apiProxyAddress: "https://api.deepseek.com",
    apiKey: "",
    models: [
      LLMProviderModelCore({
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        desc: "DeepSeek Chat 是 DeepSeek 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
    ],
    configure: new ObjectFieldCore({
      label: "配置",
      name: "configure",
      fields: {
        stream: new SingleFieldCore({
          label: "流式输出",
          name: "stream",
          input: new CheckboxCore({
            value: false,
          }),
        }),
        temperature: new SingleFieldCore({
          label: "温度",
          name: "temperature",
          input: new InputCore({
            defaultValue: 0.5,
          }),
        }),
      },
    }),
  }),
  LLMProviderCore({
    id: "doubao",
    name: "豆包",
    logo_uri: "/provider_dark_deepseek.png",
    apiProxyAddress: "https://api.deepseek.com",
    apiKey: "",
    models: [
      LLMProviderModelCore({
        id: "doubao-chat",
        name: "豆包 Chat",
        desc: "豆包 Chat 是豆包 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
    ],
    configure: new ObjectFieldCore({
      label: "配置",
      name: "configure",
      fields: {
        stream: new SingleFieldCore({
          label: "流式输出",
          name: "stream",
          input: new CheckboxCore({
            value: false,
          }),
        }),
      },
    }),
  }),
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
        desc: "OpenAI GPT-4o Mini 是 OpenAI 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
      LLMProviderModelCore({
        id: "openai-gpt-4o",
        name: "OpenAI GPT-4o",
        desc: "OpenAI GPT-4o 是 OpenAI 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
    ],
    configure: new ObjectFieldCore({
      label: "配置",
      name: "configure",
      fields: {
        stream: new SingleFieldCore({
          label: "流式输出",
          name: "stream",
          input: new CheckboxCore({
            value: false,
          }),
        }),
      },
    }),
  }),
];

export const llm = LLMProviderStore({
  providers: LLMProviders,
});
