import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
  llm_configs: {} as Record<
    string,
    {
      id: string;
      enabled: boolean;
      apiProxyAddress?: string;
      apiKey?: string;
      models: { id: string; enabled: boolean; builtin: boolean }[];
    }
  >,
  agent_configs: {} as Record<
    string,
    {
      id: string;
      llm: {
        provider_id: string;
        model_id: string;
        extra: Record<string, any>;
      };
    }
  >,
  tab: "tauri",
  newuser: 1,
  file: null as null | { name: string; content: string },
};
const key = "global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: globalThis.localStorage,
});
