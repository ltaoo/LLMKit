import { LLMProviders } from "@llm/providers";

import { LLMProviderStore as LLMProviderStore } from "@llm/libs/llm_provider";

import { storage } from "./storage";

export const llm = LLMProviderStore({
  providers: LLMProviders,
});
