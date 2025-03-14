import { AgentCore, AgentStore } from "@/biz/agent";

import { llm } from "./llm";
import { client } from "./request";
import { storage } from "./storage";

export const agents = AgentStore({
  agents: [
    AgentCore({
      id: "1",
      name: "纠错",
      desc: "可以对中文进行纠错",
      prompt: "你是一个中文纠错专家，请对以下中文进行纠错，并给出纠错后的结果。",
      client,
      responseHandler: (result) => result,
      builder: () => {},
    }),
    AgentCore({
      id: "2",
      name: "润色",
      desc: "可以对中文进行润色",
      prompt: "你是一个中文润色专家，请对以下中文进行润色，并给出润色后的结果。",
      client,
      responseHandler: (result) => result,
      builder: () => {},
    }),
    AgentCore({
      id: "3",
      name: "翻译成英文",
      desc: "可以对中文进行翻译成英文",
      prompt: "你是一个中文翻译成英文专家，请对以下中文进行翻译成英文，并给出翻译后的结果。",
      client,
      responseHandler: (result) => result,
      builder: () => {},
    }),
    AgentCore({
      id: "4",
      name: "查询",
      desc: "可以对中文进行查询",
      prompt: "你是一个中文字典，请对以下中文进行查询，并给出查询后的结果。",
      client,
      responseHandler: (result) => result,
      builder: () => {},
    }),
  ],
  llm,
  client,
});
