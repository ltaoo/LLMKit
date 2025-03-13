/**
 * 将对象转成 search 字符串，前面不带 ?
 * @param query
 * @returns
 */
export function query_stringify(query?: null | Record<string, any>) {
  if (query === null) {
    return "";
  }
  if (query === undefined) {
    return "";
  }
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      // @ts-ignore
      return `${key}=${encodeURIComponent(query[key])}`;
    })
    .join("&");
}
