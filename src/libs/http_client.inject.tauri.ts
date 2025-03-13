// @ts-ignore
import { invoke } from "@tauri-apps/api/core";

import { HttpClientCore } from "./http_client";

export function injectHttpClient(store: HttpClientCore) {
  store.fetch = async (options) => {
    const { url, method, id, data, headers } = options;
    try {
      // console.log("[DOMAIN]http_client - before invoke", data);
      const r: any = await invoke(url, data as any);
      // return Promise.resolve(Result.Ok(r));
      return Promise.resolve({ data: r });
    } catch (err) {
      console.log("[DOMAIN]http_client - connect - error", err);
      // return Promise.resolve(Result.Err((err as Error).message));
      throw err;
    }
  };
}
