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
  } = { ...LLMServiceInWeb.DefaultPayload };

  return {
    get payload() {
      return _payload;
    },
    setPayload(
      payload: {
        provider_id: string;
        model_id: string;
        apiProxyAddress: string;
        apiKey: string;
        extra: Record<string, any>;
      },
      extra?: Record<string, any>
    ) {
      console.log("[LLMSDK]llm_service.web - setPayload", payload, extra);
      _payload = {
        provider_id: payload.provider_id,
        model_id: payload.model_id,
        apiProxyAddress: payload.apiProxyAddress,
        apiKey: payload.apiKey,
        extra: payload.extra,
      };
    },
    updateExtra(extra: Record<string, any>) {
      if (!_payload) {
        return Result.Err("缺少配置参数");
      }
      _payload.extra = { ..._payload.extra, ...extra };
    },
    async request(
      messages: { role: string; content: string }[],
      extra: Record<string, any> = {}
    ) {
      if (!_payload) {
        return Result.Err("缺少配置参数");
      }
      const body = {
        model: _payload.model_id,
        messages,
        apiProxyAddress: _payload.apiProxyAddress,
        apiKey: _payload.apiKey,
        extra: _payload.extra,
      };
      console.log(
        "[LLMSDK]llm_service.web - request before request",
        body,
        extra
      );
      const payload = await _service(body);
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
      if (r2.data.error) {
        const msg = r2.data.error.message;
        if (msg) {
          return Result.Err(msg);
        }
        return Result.Err("调用模型发生错误");
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
