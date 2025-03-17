import {
  ObjectFieldCore,
  SingleFieldCore,
  ArrayFieldCore,
  FormInputInterface,
} from "./form";
import { InputCore } from "./input";
import { CheckboxCore } from "./checkbox";

// JSON 结构的类型定义
export interface FormFieldJSON {
  type: string;
  label: string;
  name: string;
  fields?: Record<string, FormFieldJSON | null> | null | FormFieldJSON;
  input?: {
    type: FormInputInterface<any>["shape"];
    defaultValue?: any;
  };
}

// 从 JSON 转换为表单配置对象
export function fromJSON(
  json: FormFieldJSON
): ObjectFieldCore<any> | SingleFieldCore<any> | ArrayFieldCore<any> {
  switch (json.type) {
    case "object":
      return new ObjectFieldCore({
        label: json.label,
        name: json.name,
        fields: Object.entries(json.fields || {}).reduce(
          (acc, [key, field]) => {
            acc[key] = fromJSON(field);
            return acc;
          },
          {} as Record<
            string,
            ObjectFieldCore<any> | SingleFieldCore<any> | ArrayFieldCore<any>
          >
        ),
      });

    case "single":
      return new SingleFieldCore({
        label: json.label,
        name: json.name,
        input: createInput(json.input!),
      });

    default:
      throw new Error(`Unknown field type: ${json.type}`);
  }
}

// 从表单配置对象转换为 JSON
export function toJSON(
  field: ObjectFieldCore<any> | SingleFieldCore<any> | ArrayFieldCore<any>
): FormFieldJSON | null {
  if (field instanceof ObjectFieldCore) {
    return {
      type: "object",
      label: field.label,
      name: field.name,
      fields: Object.entries(field.fields).reduce((acc, [key, field]) => {
        acc[key] = toJSON(field);
        return acc;
      }, {} as Record<string, FormFieldJSON | null>),
    };
  }

  if (field instanceof SingleFieldCore) {
    return {
      type: "single",
      label: field.label,
      name: field.name,
      input: getInputJSON(field.input),
    };
  }

  if (field instanceof ArrayFieldCore) {
    return {
      type: "array",
      label: field.label,
      name: field.name,
      fields: (() => {
        const f = field.fields[0];
        if (!f) {
          return null;
        }
        return toJSON(f);
      })(),
    };
  }
  return null;
}

function createInput(json: NonNullable<FormFieldJSON["input"]>) {
  switch (json.type) {
    case "checkbox":
      return new CheckboxCore({
        defaultValue: json.defaultValue,
      });
    default:
      return new InputCore({
        defaultValue: json.defaultValue,
      });
  }
}

function getInputJSON(input: InputCore<any> | CheckboxCore) {
  if (input.shape === "checkbox") {
    return {
      type: "checkbox" as const,
      defaultValue: input.defaultValue,
    };
  }
  return {
    type: "input" as const,
    defaultValue: input.defaultValue,
  };
}
