import { LLMAgentCore, LLMAgentStore } from "@llm/libs/llm_agent";
import { Result } from "@llm/libs/result";
import { ChatBoxPayload, ChatBoxPayloadType } from "@llm/libs/chatbox";
import { LLMServiceInWeb } from "@llm/libs/llm_service.web";
import { build_request } from "@llm/libs/request_builder";

import { find_llm_agent_by_id, find_llm_agent_by_name } from "@/biz/services";
import { RequestCore } from "@/domains/request";

import { llm_store } from "./llm";
import { client } from "./request";

/********************** LLM Service *****************/
const request = build_request({
  hostnames: {},
  process(v) {
    return v;
  },
});
function requestLLMProvider(payload: {
  extra: Record<string, any>;
  model: string;
  messages: { role: string; content: string }[];
  apiProxyAddress: string;
  apiKey: string;
}) {
  return request.post<{}>("api_v1_chat", { payload });
}
export const llm_service = LLMServiceInWeb({
  service: requestLLMProvider,
  client,
});

export enum ChatBoxPayloadCustomType {
  Vocabulary = "vocabulary",
}
export const agent_store = LLMAgentStore({
  agents: [],
  llm_store: llm_store,
  client,
  llm_service,
});
const find_llm_agent_by_id_request = new RequestCore(find_llm_agent_by_id, {
  client,
});
const find_llm_agent_by_name_request = new RequestCore(find_llm_agent_by_name, {
  client,
});
agent_store.findAgentById = async (id: string) => {
  const r1 = agent_store.agents.find((agent) => agent.id === id);
  if (r1) {
    return Result.Ok(r1);
  }
  const r = await find_llm_agent_by_id_request.run({ id });
  if (r.error) {
    return Result.Err(r.error);
  }
  const r2 = await agent_store.buildFromOuter(r.data);
  if (r2.error) {
    return Result.Err(r2.error);
  }
  return Result.Ok(r2.data);
};
agent_store.findAgentByName = async (name: string) => {
  const r1 = agent_store.agents.find((agent) => agent.name === name);
  if (r1) {
    return Result.Ok(r1);
  }
  const r = await find_llm_agent_by_name_request.run({ name });
  if (r.error) {
    return Result.Err(r.error);
  }
  const r2 = await agent_store.buildFromOuter(r.data);
  if (r2.error) {
    return Result.Err(r2.error);
  }
  return Result.Ok(r2.data);
};
agent_store.buildFromOuter = (data) => {
  const agent = LLMAgentCore({
    id: data.id,
    name: data.name,
    desc: data.desc,
    prompt: data.prompt,
    llm_config: {
      provider_id: data.llm_provider_id,
      model_id: data.llm_model_id,
      extra: JSON.parse(data.llm_config),
    },
    config: JSON.parse(data.config),
    builtin: data.builtin === 1,
  });
  return Result.Ok(agent);
};

// const cached = storage.get("agent_configs");
// console.log("[STORE]agents - cached", cached);
// agent_store.patch(cached);
const CustomAgent = LLMAgentCore({
  id: "5",
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
  config: {
    memorize: false,
  },
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
});
