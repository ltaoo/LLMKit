import { describe, it, expect } from "vitest";

import { InputCore } from "@/domains/ui/form/input";

import { ObjectFieldCore, SingleFieldCore, ArrayFieldCore } from "../index";

describe("Form", () => {
  it("should be a function", async () => {
    const form = new ObjectFieldCore({
      label: "用户信息",
      name: "user",
      fields: {
        name: new SingleFieldCore({
          label: "姓名",
          name: "name",
          input: new InputCore({
            defaultValue: "张三",
          }),
        }),
        age: new SingleFieldCore({
          label: "年龄",
          name: "age",
          input: new InputCore({
            defaultValue: 18,
          }),
        }),
        hobbies: new ArrayFieldCore({
          label: "爱好",
          name: "hobbies",
          field: (count: number) => {
            return new SingleFieldCore({
              label: "爱好",
              name: `hobbies[${count}]`,
              input: new InputCore({
                defaultValue: "游泳",
              }),
            });
          },
        }),
        address: new ArrayFieldCore({
          label: "地址",
          name: "address",
          field: (count: number) => {
            return new ObjectFieldCore({
              label: "地址",
              name: `address[${count}]`,
              fields: {
                code: new SingleFieldCore({
                  label: "邮政编码",
                  name: `code[${count}]`,
                  input: new InputCore({
                    defaultValue: "100000",
                  }),
                }),
                address: new SingleFieldCore({
                  label: "地址",
                  name: `address[${count}]`,
                  input: new InputCore({
                    defaultValue: "北京市海淀区",
                  }),
                }),
              },
            });
          },
        }),
      },
    });

    const r = await form.validate();
    if (r.error) {
      return;
    }
    const value = r.data;
    expect(form.value).toBe("张三");
    expect(value.name).toBe("张三");
    expect(value.age).toBe(18);
    expect(value.hobbies).toEqual(["游泳"]);
    expect(value.address).toEqual([
      {
        code: "100000",
        address: "北京市海淀区",
      },
    ]);
  });
});
