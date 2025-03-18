import { LLMAgentStore, LLMAgentCore } from "@llmkit/libs/llm_agent";
import { LLMProviderStore } from "@llmkit/libs/llm_provider";
import { LLMProviders } from "@llmkit/providers";
import { Result } from "@llmkit/libs/result";
import { HttpClientCore } from "@llmkit/libs/http_client";
import { injectHttpClient } from "@llmkit/libs/http_client.inject.axios";
import { StorageCore } from "@llmkit/libs/storage";
import { ChatRoomCore } from "@llmkit/libs/chatroom";
import { ChatBoxPayload, ChatBoxPayloadType } from "@llmkit/libs/chatbox";
import { LLMServiceInWeb } from "@llmkit/libs/llm_service.web";
import { build_request } from "@llmkit/libs/request_builder";

const DEFAULT_CACHE_VALUES = {
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
        extra: Record<string, any>;
      };
    }
  >,
};
const key = "global";
const e = globalThis.localStorage.getItem(key);
/********************** LocalStorage *****************/
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: globalThis.localStorage,
});

/********************** HttpClient *****************/
export const client = new HttpClientCore({
  hostname: "http://localhost:8080",
});
injectHttpClient(client);

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
  return request.post<{}>("/api/v1/chat", payload);
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
      name: "纠错",
      desc: "可以对中文进行纠错",
      prompt:
        "你是一个中文纠错专家，请对以下中文进行纠错，并给出纠错后的结果。",
    }),
    LLMAgentCore({
      id: 2,
      name: "润色",
      desc: "可以对中文进行润色",
      prompt:
        "你是一个中文润色专家，请对以下中文进行润色，并给出润色后的结果。",
    }),
    LLMAgentCore({
      id: 3,
      name: "翻译成英文",
      desc: "可以对中文进行翻译成英文",
      prompt:
        "你是一个中文翻译成英文专家，请对以下中文进行翻译成英文，并给出翻译后的结果。",
    }),
    LLMAgentCore({
      id: 4,
      name: "查询",
      desc: "可以对中文进行查询",
      prompt: "你是一个中文字典，请对以下中文进行查询，并给出查询后的结果。",
    }),
    LLMAgentCore({
      id: 5,
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

export const chatroom = ChatRoomCore({});
