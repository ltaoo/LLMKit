import { LLMProviderStore, AgentStore, AgentCore } from "@/index";
import { LLMProviders } from "@/providers";
import { Result } from "@/libs/result";
import { HttpClientCore } from "@/libs/http_client";
import { injectHttpClient } from "@/libs/http_client.inject.axios";
import { StorageCore } from "@/libs/storage";
import { ChatRoomCore } from "@/libs/chatroom";
import { ChatBoxPayload, ChatBoxPayloadType } from "@/libs/chatbox";
import { LLMServiceInWeb } from "@/libs/llm_service.web";

const DEFAULT_CACHE_VALUES = {
  llm_configs: {} as Record<
    string,
    {
      id: string;
      enabled: boolean;
      apiProxyAddress?: string;
      apiKey?: string;
      models: { id: string; enabled: boolean; buildin: boolean }[];
    }
  >,
  agent_configs: {} as Record<
    string,
    {
      id: string;
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
export const client = new HttpClientCore({});
injectHttpClient(client);

/********************** LLM *****************/
export const llm_store = LLMProviderStore({
  providers: LLMProviders,
});

/********************** LLM Service *****************/
export const llm_service = LLMServiceInWeb({ client });

/********************** LLMAgent *****************/
function DefaultAgentResponseHandler(text: string) {
  return Result.Ok(text);
}
function DefaultAgentBuilder(payload: any): ChatBoxPayload {
  return {
    type: ChatBoxPayloadType.Text,
    text: payload as string,
  };
}
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
    AgentCore({
      id: "2",
      name: "润色",
      desc: "可以对中文进行润色",
      prompt:
        "你是一个中文润色专家，请对以下中文进行润色，并给出润色后的结果。",
      client,
      responseHandler: DefaultAgentResponseHandler,
      builder: DefaultAgentBuilder,
    }),
    AgentCore({
      id: "3",
      name: "翻译成英文",
      desc: "可以对中文进行翻译成英文",
      prompt:
        "你是一个中文翻译成英文专家，请对以下中文进行翻译成英文，并给出翻译后的结果。",
      client,
      responseHandler: DefaultAgentResponseHandler,
      builder: DefaultAgentBuilder,
    }),
    AgentCore({
      id: "4",
      name: "查询",
      desc: "可以对中文进行查询",
      prompt: "你是一个中文字典，请对以下中文进行查询，并给出查询后的结果。",
      client,
      responseHandler: DefaultAgentResponseHandler,
      builder: DefaultAgentBuilder,
    }),
  ],
  llm_store: llm_store,
  client,
  llm_service,
});

export const chatroom = ChatRoomCore();
