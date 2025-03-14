import { Result } from "./result";
import { HttpClientCore } from "./http_client";
import { LLMService } from "./llm_service";
import { RequestPayload } from "./request_builder";

type LLMServiceInWebProps = {
  service: (...args: any[]) => RequestPayload<any>;
  client: HttpClientCore;
};
export function LLMServiceInWeb(props: LLMServiceInWebProps): LLMService {
  let _payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  } = LLMServiceInWeb.DefaultPayload;
  let _service = props.service;

  return {
    setPayload(payload: {
      provider_id: string;
      model_id: string;
      apiProxyAddress: string;
      apiKey: string;
      extra: Record<string, any>;
    }) {
      _payload = payload;
    },
    updateExtra(extra: Record<string, any>) {
      if (!_payload) {
        return Result.Err("缺少配置参数");
      }
      _payload.extra = { ..._payload.extra, ...extra };
    },
    async request(messages: { role: string; content: string }[]) {
      if (!_payload) {
        return Result.Err("缺少配置参数");
      }
      const body = {
        extra: _payload.extra,
        model: _payload.model_id,
        messages,
        apiProxyAddress: _payload.apiProxyAddress,
        apiKey: _payload.apiKey,
      };
      const r = await props.client.post<{
        code: number;
        msg: string;
        data: {
          id: string;
          object: string;
          created: number;
          model: string;
          choices: { message: { content: string } }[];
        };
      }>("/api/v1/chat", body, {});
      if (r.error) {
        return Result.Err(r.error.message);
      }
      if (r.data.code !== 0) {
        return Result.Err(r.data.msg);
      }
      const content = r.data.data.choices[0].message.content;
      return Result.Ok(content);
    },
  };
}

LLMServiceInWeb.DefaultPayload = {
  provider_id: "deepseek",
  model_id: "deepseek-chat",
  apiProxyAddress: "",
  apiKey: "",
  extra: {},
};
LLMServiceInWeb.SetDefaultPayload = (payload: {
  provider_id: string;
  model_id: string;
  apiProxyAddress: string;
  apiKey: string;
  extra: Record<string, any>;
}) => {
  LLMServiceInWeb.DefaultPayload = payload;
};

export type LLMServiceInWeb = ReturnType<typeof LLMServiceInWeb>;
