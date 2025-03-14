import { request } from "@/biz/requests";
import { ListResponse, ListResponseWithCursor } from "@/biz/requests/types";
import { FetchParams } from "@/domains/list/typing";
import { TmpRequestResp } from "@/domains/request/utils";
import { Result } from "@/domains/result";

/**
 * 创建文章
 */
export function create_article(payload: { title: string; paragraphs: string[] }) {
  return request.post("create_article", payload);
}

/**
 * 获取文章列表
 */
export function fetch_articles(payload: {}) {
  return request.post<
    ListResponse<{
      id: number;
      title: string;
      created_at: string;
    }>
  >("fetch_articles", payload);
}

/**
 * 获取文章详情
 */
export function fetch_article_profile(payload: { id: string }) {
  return request.post<{
    id: number;
    title: string;
    paragraphs: {
      id: number;
      text: string;
      translation1: string;
    }[];
    created_at: string;
  }>("fetch_article_profile", { id: Number(payload.id) });
}

export function update_article_paragraph(payload: { id: number; text: string; translation1: string }) {
  return request.post("update_article_paragraph", payload);
}
export function translate_with_deeplx(payload: { message: string }) {
  return request.post<{
    response: string;
    usage: string;
  }>("translate_with_deeplx", {
    text: payload.message,
  });
}
export function chat_with_deepseek(payload: { message: string }) {
  return request.post<{
    response: string;
    usage: string;
  }>("chat_with_deepseek", payload);
}
type WordProfile = {
  word: string;
  pronunciation: {
    uk: string;
    us: string;
    uk_tip: string;
    us_tip: string;
  };
  translation: string;
  meanings: {
    part_of_speech: string;
    definitions: {
      definition: string;
      example: string;
    }[];
  }[];
  tenses: {
    base: string;
    comparative: string;
    superlative: string;
  };
  word_formation: {
    root: string;
    prefix: null;
    suffix: null;
  };
  derived_forms: {
    form: string;
    part_of_speech: string;
    definition: string;
    example: string;
    ipa: string;
  }[];
  synonyms: string;
  antonyms: string;
};
export function translate_word(payload: { word: string }) {
  return request.post<{
    id: number;
    detail: WordProfile;
  }>("translate_word", payload);
}

export function fetch_words(payload: { next_marker: string; pageSize: number }) {
  // console.log("[SERVICE]fetch_words", payload);
  return request.post<
    ListResponseWithCursor<{
      id: number;
      word: string;
      translation1: string;
      detail: string;
    }>
  >("fetch_words", {
    next_marker: Number(payload.next_marker),
    page_size: Number(payload.pageSize),
  });
}

export function fetch_words_process(r: TmpRequestResp<typeof fetch_words>) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  return Result.Ok({
    ...r.data,
    next_marker: r.data.next_marker,
    list: r.data.list.map((item) => {
      const profile: WordProfile = JSON.parse(item.detail);
      return {
        id: item.id,
        ...profile,
      };
    }),
  });
}

export function play_audio_with_pronunciation(payload: { text: string }) {
  return request.post("play_audio_with_pronunciation", payload);
}

export function fetch_dictionaries(payload: FetchParams) {
  return request.post<
    ListResponseWithCursor<{
      name: string;
      description: string;
      dict_type: string;
      version: string;
      created_at: string;
    }>
  >("fetch_dictionaries", {
    page: payload.page,
    page_size: payload.pageSize,
  });
}

export function load_dictionary(payload: { dict_path: string }) {
  return request.post("load_dictionary", payload);
}

export function look_up_text_in_direction(payload: { text: string }) {
  return request.post<{
    list: {
      name: string;
      results: {
        text: string;
        definition: string;
      }[];
    }[];
  }>("look_up_text_in_direction", payload);
}

export function load_comic(payload: { file_path: string }) {
  return request.post("load_comic", payload);
}
export function fetch_comics(payload: FetchParams) {
  return request.post<
    ListResponse<{
      id: number;
      name: string;
      description: string;
      cover_path: string;
      created_at: string;
    }>
  >("fetch_comics", {
    page: payload.page,
    page_size: payload.pageSize,
  });
}

export function remove_comic(payload: { comic_id: number }) {
  return request.post("remove_comic", payload);
}

export function fetch_comic_files(payload: { comic_id: number } & FetchParams) {
  return request.post<{
    total: number;
    list: {
      idx: number;
      file_path: string;
    }[];
    start_idx: number;
    end_idx: number;
  }>("fetch_comic_files", {
    comic_id: Number(payload.comic_id),
    start_idx: payload.page !== 1 ? Number((payload.page - 1) * payload.pageSize) : undefined,
    end_idx: payload.page !== 1 ? Number(payload.page * payload.pageSize) : undefined,
  });
}

export function render_comic_file(payload: { comic_id: number; file_path: string }) {
  return request.post<{ base64: string; mime_type: string }>("render_comic_image", payload);
}

export function test(payload: { file_path: string }) {
  return request.post<{ text: string }>("transcribe_audio", payload);
}

export function check_grammarly(payload: { content: string }) {
  return request.post<{
    original_text: string;
    grammar_errors: {
      error: string;
      suggestion: string;
      start_index: number;
      end_index: number;
    }[];
    optimized_text: string;
  }>("check_grammarly", payload);
}

type TextError = {
  start_index: number;
  end_index: number;
  suggestion: string;
  error: string;
};
type TextNode = {
  text: string;
  space?: boolean;
  error?: TextError;
};
// 0I1 2h3a4s5 6a7 8a9p10p11l12e13 14a15n16d17 18i19t20 21t22a23s24t25e26 27g28o29o30d21
export function text_to_nodes(text: string, errors: TextError[]) {
  // 按照位置排序错误
  const sorted_errors = [...errors].sort((a, b) => a.start_index - b.start_index);

  const nodes: Array<TextNode> = [];

  let i = 0;
  let error_i = 0;
  let collect_error = false;
  let node: null | TextNode = null;
  let error_node = sorted_errors[error_i];
  // if (!error_node) {
  //   nodes.push({
  //     text,
  //   });
  //   return nodes;
  // }
  while (i < text.length) {
    // const matched = sorted_errors.find((v) => v.start_index === i);
    const t = text[i];
    // console.log(i, t);
    if (error_node && i === error_node.start_index) {
      collect_error = true;
      if (node) {
        // console.log("save normal text node");
        nodes.push(node);
      }
      node = {
        text: t,
        error: error_node,
      };
      i += 1;
      continue;
    }
    if (error_node && i === error_node.end_index) {
      collect_error = false;
      if (node) {
        // console.log("save error node");
        nodes.push(node);
        node = null;
      }
      // node = {
      //   text: t,
      // };
      error_i += 1;
      error_node = sorted_errors[error_i];
      // if (!error_node) {
      //   nodes.push({
      //     text: text.slice(i, text.length),
      //   });
      //   return nodes;
      // }
      // i += 1;
      // continue;
    }
    if (t === " " && !collect_error) {
      if (node) {
        nodes.push(node);
      }
      // console.log("save space node");
      nodes.push({
        text: t,
        space: true,
      });
      node = null;
      // node = {
      //   text: "",
      // };
      i += 1;
      continue;
    }
    if (!node) {
      node = {
        text: "",
      };
    }
    if (node) {
      node.text += t;
    }
    i += 1;
  }
  if (node) {
    nodes.push(node);
  }
  return nodes;
}

export function check_grammarly_process(r: TmpRequestResp<typeof check_grammarly>) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const { original_text, grammar_errors, optimized_text } = r.data;

  // for (const error of sorted_errors) {
  //   // 添加错误之前的正常文本
  //   if (error.start_index > i) {
  //     nodes.push({
  //       text: original_text.slice(i, error.start_index),
  //     });
  //     nodes.push({
  //       text: " ",
  //       space: true,
  //     });
  //   }
  //   // 添加错误文本节点
  //   nodes.push({
  //     text: original_text.slice(error.start_index, error.end_index),
  //     error: {
  //       suggestion: error.suggestion,
  //       description: error.error,
  //     },
  //   });
  //   i = error.end_index;
  // }
  // if (i < original_text.length) {
  //   nodes.push({
  //     text: original_text.slice(i),
  //   });
  // }
  const nodes = text_to_nodes(original_text, grammar_errors);
  return Result.Ok({
    nodes,
    optimized_text,
  });
}
