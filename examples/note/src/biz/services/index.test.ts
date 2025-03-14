import { describe, it, expect } from "vitest";

import { text_to_nodes } from "./index";

describe("text_to_nodes", () => {
  it("three error nodes", () => {
    const text = "I has a apple and it taste good";
    const errors = [
      {
        start_index: 2,
        end_index: 5,
        suggestion: "",
        error: "",
      },
      {
        start_index: 6,
        end_index: 7,
        suggestion: "",
        error: "",
      },
      {
        start_index: 21,
        end_index: 26,
        suggestion: "",
        error: "",
      },
    ];
    const result = text_to_nodes(text, errors);
    expect(result).toStrictEqual([
      {
        text: "I",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "has",
        error: {
          start_index: 2,
          end_index: 5,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "a",
        error: {
          start_index: 6,
          end_index: 7,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "apple",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "and",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "it",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "taste",
        error: {
          start_index: 21,
          end_index: 26,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "good",
      },
    ]);
  });

  it("there is no error nodes", () => {
    const text = "I has a apple and it taste good";
    const errors: { start_index: number; end_index: number; error: string; suggestion: string }[] = [];
    const result = text_to_nodes(text, errors);
    expect(result).toStrictEqual([
      {
        text: "I",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "has",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "a",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "apple",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "and",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "it",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "taste",
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "good",
      },
    ]);
  });

  it("whole the text is incorrect", () => {
    const text = "I has a apple and it taste good";
    const errors: { start_index: number; end_index: number; error: string; suggestion: string }[] = [
      {
        start_index: 0,
        end_index: 1,
        suggestion: "",
        error: "",
      },
      {
        start_index: 2,
        end_index: 5,
        suggestion: "",
        error: "",
      },
      {
        start_index: 6,
        end_index: 7,
        suggestion: "",
        error: "",
      },
      {
        start_index: 8,
        end_index: 20,
        suggestion: "",
        error: "",
      },
      {
        start_index: 21,
        end_index: 26,
        suggestion: "",
        error: "",
      },
      {
        start_index: 27,
        end_index: 31,
        suggestion: "",
        error: "",
      },
    ];
    const result = text_to_nodes(text, errors);
    expect(result).toStrictEqual([
      {
        text: "I",
        error: {
          start_index: 0,
          end_index: 1,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "has",
        error: {
          start_index: 2,
          end_index: 5,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "a",
        error: {
          start_index: 6,
          end_index: 7,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "apple and it",
        error: {
          start_index: 8,
          end_index: 20,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "taste",
        error: {
          start_index: 21,
          end_index: 26,
          suggestion: "",
          error: "",
        },
      },
      {
        text: " ",
        space: true,
      },
      {
        text: "good",
        error: {
          start_index: 27,
          end_index: 31,
          suggestion: "",
          error: "",
        },
      },
    ]);
  });
});
