import { describe, it, expect } from "vitest";

import { InputCore } from "@/domains/ui/form/input";

import { FormCore } from "../index";
import { FormFieldCore } from "../field";
import { ListContainerCore } from "../list";

describe("Form", () => {
  it("should be a function", async () => {
    const form = FormCore({
      fields: {
        name: new FormFieldCore({
          label: "姓名",
          name: "name",
          input: new InputCore({
            defaultValue: "张三",
          }),
        }),
        age: new FormFieldCore({
          label: "年龄",
          name: "age",
          input: new InputCore({
            defaultValue: 18,
          }),
        }),
        hobbies: new FormFieldCore({
          label: "爱好",
          name: "hobbies",
          input: ListContainerCore({
            defaultValue: [],
            factory: (index: number) => {
              return new FormFieldCore({
                label: "爱好",
                name: `hobbies[${index}]`,
                input: new InputCore({
                  defaultValue: "游泳",
                }),
              });
            },
          }),
        }),
      },
    });

    const r = await form.validate();
  });
});
