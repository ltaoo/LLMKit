import { LLMAgentCore, LLMAgentStore } from "@llm/libs/llm_agent";
import { Result } from "@llm/libs/result";
import { ChatBoxPayload, ChatBoxPayloadType } from "@llm/libs/chatbox";
import { LLMServiceInWeb } from "@llm/libs/llm_service.web";
import { build_request } from "@llm/libs/request_builder";

import { llm } from "./llm";
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
  agents: [
    LLMAgentCore({
      id: "1",
      name: "纠错",
      desc: "可以对中文进行纠错",
      prompt: "你是一个中文纠错专家，请对以下中文进行纠错，并给出纠错后的结果。",
    }),
    LLMAgentCore({
      id: "2",
      name: "润色",
      desc: "可以对中文进行润色",
      prompt: "你是一个中文润色专家，请对以下中文进行润色，并给出润色后的结果。",
      memorize: false,
    }),
    LLMAgentCore({
      id: "3",
      name: "翻译成英文",
      desc: "可以对中文进行翻译成英文",
      prompt: "你是一个中文翻译成英文专家，请对以下中文进行翻译成英文，并给出翻译后的结果。",
    }),
    LLMAgentCore({
      id: "4",
      name: "查询",
      desc: "可以对中文进行查询",
      prompt: "你是一个中文字典，请对以下中文进行查询，并给出查询后的结果。",
    }),
    LLMAgentCore({
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
  llm_store: llm,
  client,
  llm_service,
});
