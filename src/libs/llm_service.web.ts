import { Result } from "./result";
import { HttpClientCore } from "./http_client";
import { LLMService } from "./llm_service";
import { RequestPayload } from "./request_builder";

type LLMServiceInWebProps = {
  service: (...args: any[]) => RequestPayload<any>;
  client: HttpClientCore;
};
export function LLMServiceInWeb(props: LLMServiceInWebProps): LLMService {
  let _service = props.service;
  let _client = props.client;

  let _payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  } = LLMServiceInWeb.DefaultPayload;

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
      const payload = await _service(body);
      // console.log("[LLMSDK]llm_service.web - request before request", payload);
      const r = await _client.post<any>(
        [payload.hostname, payload.url].join(""),
        payload.body,
        {
          headers: payload.headers,
        }
      );
      const r2 = payload.process ? payload.process(r) : r;
      if (r2.error) {
        return Result.Err(r2.error);
      }
      const content = r2.data.choices[0].message.content;
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
