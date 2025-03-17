import { request } from "@/biz/requests";
import { ListResponse } from "@/biz/requests/types";
import { FetchParams } from "@/domains/list/typing";

export function show_chat_window(payload: { url: string }) {
  return request.post("show_chat_window", payload);
}

/**
 * 获取文章列表
 */
export function fetch_note_list(payload: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      created_at: string;
    }>
  >("fetch_notes", {
    page: payload.page,
    page_size: payload.pageSize,
  });
}

/**
 * 获取文章详情
 */
export function fetch_note_profile(payload: { id: string | number }) {
  return request.post<{
    id: number;
    title: string;
    content: string;
    created_at: string;
  }>("fetch_note_profile", { id: Number(payload.id) });
}

/**
 * 创建笔记
 */
export function create_note() {
  return request.post<{ id: number; title: string }>("create_note", {});
}

/**
 * 更新文章
 */
export function update_note(payload: { id: string | number; title?: string; content?: string }) {
  return request.post<{
    id: number;
    title: string;
    content: string;
    created_at: string;
  }>("update_note", { id: Number(payload.id), title: payload.title, content: payload.content });
}

/**
 * 删除文章
 */
export function delete_note(payload: { id: string | number }) {
  return request.post("delete_note", { id: Number(payload.id) });
}

/** 获取 LLM 厂商 */
export function fetch_llm_providers() {
  return request.post<{
    list: {
      id: string;
      name: string;
      logo_uri: string;
      api_address: string;
      configure: string;
      api_proxy_address: string | null;
      api_key: string | null;
      enabled: number;
      models: {
        id: string;
        name: string;
        enabled: number;
        builtin: number;
      }[];
    }[];
  }>("fetch_llm_providers", {});
}

export function update_llm_provider(payload: {
  id: string;
  enabled: boolean;
  api_address?: string;
  api_key?: string;
  models: { id: string; enabled: boolean }[];
}) {
  return request.post("update_llm_provider", { payload });
}

export function create_provider_model(payload: { provider_id: string; model_id: string }) {
  return request.post("create_provider_model", { payload });
}

export function delete_provider_model(payload: { provider_id: string; model_id: string }) {
  return request.post("delete_provider_model", { payload });
}

export function update_provider_model(payload: { provider_id: string; model_id: string; enabled: boolean }) {
  return request.post("update_provider_model", { payload });
}

/** 获取 LLM Agent */
export function fetch_llm_agents(payload: FetchParams) {
  return request.post<
    ListResponse<{
      id: string;
      name: string;
      desc: string | null;
      avatar_uri: string | null;
      prompt: string;
      tags: string;
      agent_type: number;
      llm_config: string;
      llm_provider_id: string;
      llm_model_id: string;
      builtin: number;
      config: string;
      created_at: string;
    }>
  >("fetch_llm_agents", {
    page: payload.page,
    page_size: payload.pageSize,
  });
}
export function find_llm_agent_by_id(payload: { id: string | number }) {
  return request.post<{
    id: string;
    name: string;
    desc: string;
    avatar_uri: string;
    prompt: string;
    llm_config: string;
    llm_provider_id: string;
    llm_model_id: string;
    builtin: number;
    config: string;
    created_at: string;
  }>("find_llm_agent_by_id", {
    id: Number(payload.id),
  });
}
export function find_llm_agent_by_name(payload: { name: string }) {
  return request.post<{
    id: string;
    name: string;
    desc: string;
    avatar_uri: string;
    prompt: string;
    llm_config: string;
    llm_provider_id: string;
    llm_model_id: string;
    builtin: number;
    config: string;
    created_at: string;
  }>("find_llm_agent_by_name", {
    name: payload.name,
  });
}
// export const find_llm_agent_by_id_request =(payload: { id: string }) {
// return ;
export function update_llm_agent(payload: {
  id: string;
  name?: string;
  desc?: string;
  prompt?: string;
  llm?: {
    provider_id: string | null;
    model_id: string | null;
    extra: Record<string, any>;
  };
  config?: Record<string, any>;
}) {
  return request.post("update_llm_agent", { payload });
}

export function create_llm_agent(payload: {
  name: string;
  desc?: string;
  prompt: string;
  llm: {
    provider_id: string | null;
    model_id: string | null;
    extra: Record<string, any>;
  };
}) {
  return request.post("create_llm_agent", { payload });
}

export function delete_llm_agent(payload: { id: string | number }) {
  return request.post("delete_llm_agent", { id: Number(payload.id) });
}
