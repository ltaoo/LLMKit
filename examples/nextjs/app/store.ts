"use client";

import { LLMProviderStore } from "@llmkit/libs/llm_provider";
import { LLMProviders } from "@llmkit/providers";
import { LLMAgentStore, LLMAgentCore } from "@llmkit/libs/llm_agent";
import { Result } from "@llmkit/libs/result";
import { HttpClientCore } from "@llmkit/libs/http_client";
import { LLMServiceInWeb } from "@llmkit/libs/llm_service.web";
import { injectHttpClient } from "@llmkit/libs/http_client.inject.axios";
import { build_request } from "@llmkit/libs/request_builder";
import { BizError } from "@llmkit/libs/biz_error";
import { ChatBoxPayload, ChatBoxPayloadType } from "@llmkit/libs/chatbox";

import { UserCore } from "@/biz/user";
import { SectionPayload } from "@/biz/sponsors";
import { Application } from "@/domains/app";
import { connect as connectApplication } from "@/domains/app/connect.web";
import { StorageCore } from "@/domains/storage";
import { RequestCore } from "@/domains/request";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
  llm_configs: {} as Record<
    string,
    {
      id: string;
      enabled: boolean;
      api_proxy_address?: string;
      api_key?: string;
      models: { id: string; enabled: boolean; builtin: boolean }[];
    }
  >,
  agent_configs: {} as Record<
    string,
    {
      id: number;
      llm: {
        provider_id: string;
        model_id: string;
        extra: Record<string, string | number | boolean>;
      };
    }
  >,
};
const key = "global";
const isClient = typeof window !== "undefined";
const storageClient = (() => {
  if (isClient) {
    return window.localStorage;
  }
  return { getItem() {}, setItem() {} };
})();
const e = storageClient.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: storageClient,
});

export const user = new UserCore(storage.get("user"));
export const app = new Application({ storage });
export const client = new HttpClientCore();
if (isClient) {
  connectApplication(app);
  injectHttpClient(client);
}

function handleError(err: BizError) {
  app.tip({
    text: [err.message],
  });
  if (err.code === 900) {
    user.logout();
    return;
  }
}

/********************** LLM *****************/
export const llm_store = LLMProviderStore({
  providers: LLMProviders,
});

/********************** LLM Service *****************/
const request = build_request({
  hostnames: {},
  process(r: Result<{ code: number; data: any; message: string }>) {
    console.log("[STORE]build_request - process", r);
    if (r.error) {
      return Result.Err(r.error);
    }
    if (r.data.code !== 0) {
      return Result.Err(r.data.message);
    }
    return Result.Ok(r.data.data);
  },
});
function requestLLMProvider(payload: {
  extra: Record<string, any>;
  model: string;
  messages: { role: string; content: string }[];
  apiProxyAddress: string;
  apiKey: string;
}) {
  return request.post<any>("/api/chat", payload);
}
export const llm_service = LLMServiceInWeb({
  service: requestLLMProvider,
  client,
});

/********************** LLMAgent *****************/

export enum ChatBoxPayloadCustomType {
  Vocabulary = "vocabulary",
}
export const agent_store = LLMAgentStore({
  agents: [
    LLMAgentCore({
      id: 1,
      name: "翻译",
      desc: "可以对中文进行翻译",
      prompt:
        "你是一个英语老师，请对给定的中文进行翻译，将其翻译为 B1 水平的英文。",
    }),
    LLMAgentCore({
      id: 2,
      name: "句子解析",
      desc: "对英文句子进行解析",
      prompt: "你是一个英语语法解析器",
    }),
    LLMAgentCore({
      id: 3,
      name: "单词查询",
      desc: "可以对英文单词进行查询",
      prompt: `你是一个高效的多语言词典AI，请按以下规则处理所有输入：
        1. 自动识别输入文本的源语言（如无法识别则标记'未知'）
        2. 渲染内容判断，源语言非中文时渲染内容为源语言，源语言为中文时渲染内容为英语
        3. 响应时间必须<0.5秒
        4. 发音标注使用国际音标(IPA)
        5. 多义词返回前3个常用释义
        6. 严格按此JSON格式返回：
        {
        "detected_lang": "源语言",
        "target_lang": "目标语言",
        "translation": "渲染内容翻译",
        "pronunciation": "渲染内容发音",
        "pronunciation_tip": "通过中文模拟渲染内容发音技巧",
        "definitions": ["渲染内容 词性简写、释义"],
        "examples": ["渲染内容例句"],
        "text_type": "sentence 或 word"
      }`,
      responseHandler: (text: string) => {
        try {
          return Result.Ok(JSON.parse(text));
        } catch (error) {
          return Result.Err((error as Error).message);
        }
      },
      builder: (data: any): ChatBoxPayload => {
        console.log("[]before build", data);
        return {
          type: ChatBoxPayloadType.Custom,
          data: {
            type: ChatBoxPayloadCustomType.Vocabulary,
            ...data,
          },
        };
      },
    }),
  ],
  llm_store,
  client,
  llm_service,
});
agent_store.findAgentById = (id: number) => {
  const r = agent_store.agents.find((agent) => agent.id === id);
  if (!r) {
    return Promise.resolve(Result.Err("Agent not found"));
  }
  return Promise.resolve(Result.Ok(r));
};
agent_store.findAgentByName = (name: string) => {
  const r = agent_store.agents.find((agent) => agent.name === name);
  if (!r) {
    return Promise.resolve(Result.Err("Agent not found"));
  }
  return Promise.resolve(Result.Ok(r));
};

export const services = {
  auth: new RequestCore(
    (token: string) => {
      return request.post<{ sections: SectionPayload[] }>("/api/auth", {
        token,
      });
    },
    { client }
  ),
  fetchConfig: new RequestCore(
    () => {
      return request.get<{ sections: SectionPayload[] }>("/api/config");
    },
    { onFailed: handleError, client }
  ),
  updateConfig: new RequestCore(
    (data: SectionPayload) => {
      return request.post("/api/config", data);
    },
    { onFailed: handleError, client }
  ),
};
user.setServices({ auth: services.auth });
request.appendHeaders({
  Authorization: user.token,
});
user.onLogin((v) => {
  storage.set("user", v);
  request.appendHeaders({
    Authorization: user.token,
  });
});
