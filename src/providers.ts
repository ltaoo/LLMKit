import { LLMProviderCore, LLMProviderModelCore } from "@/libs/llm_provider";
import { ObjectFieldCore, SingleFieldCore } from "@/libs/form";
import { InputCore } from "@/libs/input";
import { CheckboxCore } from "@/libs/checkbox";

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
    logo_uri: "/provider_light_doubao.png",
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
  LLMProviderCore({
    id: "volcengine",
    name: "火山引擎",
    logo_uri: "/provider_light_doubao.png",
    apiKey: "",
    apiProxyAddress:
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    models: [
      LLMProviderModelCore({
        id: "doubao-1-5-pro-32k-250115",
        name: "doubao-1.5-pro",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "doubao-1-5-lite-32k-250115",
        name: "doubao-1.5-lite",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "deepseek-v3-241226",
        name: "deepseek-v3",
        desc: "",
        tags: [],
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
    id: "siliconflow",
    name: "硅基流动",
    logo_uri: "/provider_light_siliconcloud.png",
    apiKey: "",
    apiProxyAddress: "https://api.siliconflow.cn/v1/chat/completions",
    models: [
      LLMProviderModelCore({
        id: "Pro/deepseek-ai/DeepSeek-R1",
        name: "Pro/deepseek-ai/DeepSeek-R1",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "Pro/deepseek-ai/DeepSeek-V3",
        name: "Pro/deepseek-ai/DeepSeek-V3",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "deepseek-ai/DeepSeek-R1",
        name: "deepseek-ai/DeepSeek-R1",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "deepseek-ai/DeepSeek-V3",
        name: "deepseek-ai/DeepSeek-V3",
        desc: "",
        tags: [],
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
