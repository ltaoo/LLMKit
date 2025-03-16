import { LLMProviders } from "@llm/providers";

import { LLMProviderStore as LLMProviderStore } from "@llm/libs/llm_provider";

import { storage } from "./storage";

export const llm_store = LLMProviderStore({
  providers: LLMProviders,
});
const cached = storage.get("llm_configs");
console.log("[PAGE] before llm.patch", cached);
llm_store.patch(cached);
