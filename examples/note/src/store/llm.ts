import { LLMProviders } from "@llmkit/providers";

import { LLMProviderStore as LLMProviderStore } from "@llmkit/libs/llm_provider";

import { storage } from "./storage";

export const llm_store = LLMProviderStore({
  providers: [],
});
