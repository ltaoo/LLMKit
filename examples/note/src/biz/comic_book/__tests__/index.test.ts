import { describe, it, expect, beforeEach } from "vitest";

import { ComicBookCore } from "../index";
import { ComicBookPageCore } from "../page";

describe("ComicBook", () => {
  let comic_book: ComicBook;

  beforeEach(() => {
    comic_book = ComicBookCore({
      display: "double",
      page: 1,
      page_count: 10,
      width: 600,
      height: 800,
    });
    comic_book.methods.initialize();
    type PagePayload = {
      text: string;
    };
    //     const pages = [
    //       ComicBookPage<PagePayload>({ page: 1, payload: { text: "01.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 2, payload: { text: "02.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 3, payload: { text: "03.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 4, payload: { text: "04.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 5, payload: { text: "05.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 6, payload: { text: "06.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 7, payload: { text: "07.jpg" } }),
    //       ComicBookPage<PagePayload>({ page: 8, payload: { text: "08.jpg" } }),
    //     ];
    //     const range = comic_book.methods.range(1);
    //     for (const page of pages) {
    //       comic_book.methods.addPage(page);
    //     }
    //     comic_book.methods.page(1);
  });

  it.skip("加载第 6 页时渲染的页码", () => {
    const range = comic_book.methods.view(6);
    expect(range).toStrictEqual([6, 7]);
  });
  it.skip("加载第 6 页", () => {
    const range = comic_book.methods.range(6);
    expect(range).toStrictEqual([4, 9]);
  });
  it("添加页面", () => {
    const page = 6;
    const range = comic_book.methods.range(page);
    for (let i = range[0]; i <= range[1]; i++) {
      if (!comic_book.methods.existing(i)) {
        comic_book.methods.addPage(
          ComicBookPageCore({
            page: i,
            payload: {
              text: `${i}.jpg`,
            },
          }),
          i + 1
        );
      }
    }
    expect(range).toStrictEqual([4, 9]);
  });
  //   it("默认展示第 1、2 页", () => {
  //     expect(comic_book.state.view).toStrictEqual([1, 2]);
  //   });
});
