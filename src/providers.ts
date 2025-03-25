import { LLMProviderCore, LLMProviderModelCore } from "./libs/llm_provider";
import { ObjectFieldCore, SingleFieldCore } from "./libs/form";
import { InputCore } from "./libs/input";
import { CheckboxCore } from "./libs/checkbox";
import { toJSON, fromJSON, FormFieldJSON } from "./libs/form_json";

export const LLMProviders = [
  LLMProviderCore({
    id: "deepseek",
    name: "DeepSeek",
    logo_uri: "/provider_dark_deepseek.png",
    api_address: "https://api.deepseek.com/chat/completions",
    models: [
      LLMProviderModelCore({
        id: "deepseek-chat",
        name: "DeepSeek-V3",
        desc: "DeepSeek-V3 是 DeepSeek 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
      LLMProviderModelCore({
        id: "deepseek-reasoner",
        name: "DeepSeek-R1",
        desc: "DeepSeek-R1 是 DeepSeek 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
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
            defaultValue: false,
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
    id: "openai",
    name: "OpenAI",
    logo_uri: "/provider_light_openai.png",
    api_address: "https://api.openai.com/v1/chat/completions",
    models: [
      LLMProviderModelCore({
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        desc: "GPT-4o Mini 是 OpenAI 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
        tags: ["chat", "assistant"],
      }),
      LLMProviderModelCore({
        id: "gpt-4o",
        name: "GPT-4o",
        desc: "GPT-4o 是 OpenAI 提供的一款智能助手，支持多轮对话、知识库问答、代码解释等功能。",
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
            defaultValue: false,
          }),
        }),
      },
    }),
  }),
  LLMProviderCore({
    id: "volcengine",
    name: "火山引擎",
    logo_uri: "/provider_light_doubao.png",
    api_address: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    models: [
      LLMProviderModelCore({
        id: "doubao-1-5-vision-pro-32k-250115",
        name: "doubao-1.5-vision-pro",
        desc: "",
        tags: [],
      }),
      LLMProviderModelCore({
        id: "doubao-1-5-pro-32k-250115",
        name: "doubao-1.5-pro",
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
            defaultValue: false,
          }),
        }),
      },
    }),
  }),
  LLMProviderCore({
    id: "siliconflow",
    name: "硅基流动",
    logo_uri: "/provider_light_siliconcloud.png",
    api_address: "https://api.siliconflow.cn/v1/chat/completions",
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
            defaultValue: false,
          }),
        }),
      },
    }),
  }),
];

export interface LLMProviderJSON {
  id: string;
  name: string;
  logo_uri: string;
  apiProxyAddress: string;
  apiKey: string;
  models: Array<{
    id: string;
    name: string;
    desc: string;
    tags: string[];
  }>;
  configure: FormFieldJSON;
}
