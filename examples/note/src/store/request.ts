/**
 * @file tauri 请求
 */
import { HttpClientCore } from "@llmkit/libs/http_client";
import { injectHttpClient } from "@llmkit/libs/http_client.inject.tauri";

export const client = new HttpClientCore({
  headers: {},
});
injectHttpClient(client);
