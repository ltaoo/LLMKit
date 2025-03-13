import { Result } from "./result";

export type LLMService = {
  setPayload(payload: {
    provider_id: string;
    model_id: string;
    apiProxyAddress: string;
    apiKey: string;
    extra: Record<string, any>;
  }): void;
  updateExtra(extra: Record<string, any>): void;
  request: (
    messages: { role: string; content: string }[]
  ) => Promise<Result<string>>;
};
