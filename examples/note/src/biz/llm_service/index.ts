import { HttpClientCore } from "@/domains/http_client";
import { Result } from "@/domains/result";

type LLMServiceProps = {
  client: HttpClientCore;
};
export function LLMService(props: LLMServiceProps) {
  let _payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  } = LLMService.DefaultPayload;

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

LLMService.DefaultPayload = {
  provider_id: "deepseek",
  model_id: "deepseek-chat",
  apiProxyAddress: "",
  apiKey: "",
  extra: {},
};
LLMService.SetDefaultPayload = (payload: {
  provider_id: string;
  model_id: string;
  apiProxyAddress: string;
  apiKey: string;
  extra: Record<string, any>;
}) => {
  LLMService.DefaultPayload = payload;
};

export type LLMService = ReturnType<typeof LLMService>;
