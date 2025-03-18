import { Result } from "./result";

export type LLMService = {
  payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  };
  setPayload(payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  }, extra?: Record<string, any>): void;
  updateExtra(extra: Record<string, any>): void;
  request: (messages: { role: string; content: string }[], extra?: Record<string, any>) => Promise<Result<string>>;
};
