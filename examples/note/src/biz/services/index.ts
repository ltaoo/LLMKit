import { request } from "@/biz/requests";
import { ListResponse } from "@/biz/requests/types";
import { BizResponse } from "@/biz/requests/types";
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
