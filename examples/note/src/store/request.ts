/**
 * @file tauri 请求
 */
import { HttpClientCore } from "@llm/libs/http_client";
import { injectHttpClient } from "@llm/libs/http_client.inject.tauri";

export const client = new HttpClientCore({
  headers: {},
});
injectHttpClient(client);
