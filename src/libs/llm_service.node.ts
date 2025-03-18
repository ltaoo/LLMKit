import { Result } from "./result";
import { HttpClientCore } from "./http_client";
import { LLMService } from "./llm_service";

type LLMServiceInNodeProps = {
  client: HttpClientCore;
};
export function LLMServiceInNode(props: LLMServiceInNodeProps): LLMService {
  let _payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  } = { ...LLMServiceInNode.DefaultPayload };

  return {
    get payload() {
      return _payload;
    },
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
        ..._payload.extra,
        model: _payload.model_id,
        messages,
      };
      const r = await props.client.post<{
        id: string;
        object: string;
        created: number;
        model: string;
        choices: { message: { content: string } }[];
      }>(_payload.apiProxyAddress, body, {
        headers: {
          Authorization: `Bearer ${_payload.apiKey}`,
        },
      });
      if (r.error) {
        return Result.Err(r.error.message);
      }
      const content = r.data.choices[0].message.content;
      return Result.Ok(content);
    },
  };
}

LLMServiceInNode.DefaultPayload = {
  provider_id: "deepseek",
  model_id: "deepseek-chat",
  apiProxyAddress: "",
  apiKey: "",
  extra: {},
};
LLMServiceInNode.SetDefaultPayload = (payload: {
  provider_id: string;
  model_id: string;
  apiProxyAddress: string;
  apiKey: string;
  extra: Record<string, any>;
}) => {
  LLMServiceInNode.DefaultPayload = payload;
};

export type LLMServiceInNode = ReturnType<typeof LLMServiceInNode>;
