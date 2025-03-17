import { base, Handler } from "./base";
import { Result } from "./result";
import { BizError } from "./biz_error";

// import { FormInputInterface } from "./types";

type CommonRuleCore = {
  required: boolean;
};
type NumberRuleCore = {
  min: number;
  max: number;
};
type StringRuleCore = {
  minLength: number;
  maxLength: number;
};
type FieldRuleCore = CommonRuleCore & NumberRuleCore & StringRuleCore;
type FormFieldCoreProps = {
  label: string;
  name: string;
  rules?: FieldRuleCore[];
};
export function FormFieldCore<T>(props: FormFieldCoreProps) {
  const { label, name } = props;

  return {
    label,
    name,
    //     input,

    setValue() {},
    validate() {},
  };
}

export type FormValidateResult = {
  valid: boolean;
  value: any;
  errors: BizError[];
};

type SingleFieldCoreProps<T> = FormFieldCoreProps & {
  input: T;
};
export class SingleFieldCore<T extends FormInputInterface<any>> {
  symbol = "SingleFieldCore" as const;
  _label: string;
  _name: string;
  _input: T;
  _rules: FieldRuleCore[];

  constructor(props: SingleFieldCoreProps<T>) {
    const { label, name, rules = [], input } = props;

    this._label = label;
    this._name = name;
    this._input = input;
    this._rules = rules;
  }
  get label() {
    return this._label;
  }
  get name() {
    return this._name;
  }
  get input() {
    return this._input;
  }
  get value() {
    return this._input.value as T["value"];
  }
  setValue(value: T["value"]) {
    const v = (() => {
      if (value !== undefined) {
        return value;
      }
      return this._input.defaultValue;
    })();
    //     console.log("[DOMAIN]formv2 - SingleField - setValue", v);
    this._input.value = v;
  }
  handleValueChange(value: T["value"]) {
    //     this._input.handleValueChange(value);
  }
  async validate() {
    const value = this._input.value;
    const errors: BizError[] = [];
    for (let i = 0; i < this._rules.length; i += 1) {
      const rule = this._rules[i];
      if (rule.required && !value) {
        errors.push(new BizError(`${this._label}不能为空`));
      }
      if (this._input.shape === "number") {
        if (rule.min && typeof value === "number" && value < rule.min) {
          errors.push(new BizError(`${this._label}不能小于${rule.min}`));
        }
        if (rule.max && typeof value === "number" && value > rule.max) {
          errors.push(new BizError(`${this._label}不能大于${rule.max}`));
        }
      }
    }
    if (errors.length > 0) {
      return Result.Err(new BizError(errors.join("\n")));
    }
    return Result.Ok(value);
  }
  clear() {
    this.setValue(this._input.defaultValue);
  }
}

type ArrayFieldCoreProps<
  T extends (
    count: number
  ) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> = FormFieldCoreProps & {
  field: T;
};
type ArrayFieldValue<
  T extends (
    count: number
  ) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> = ReturnType<T>["value"];
// type ArrayFieldValue<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> = {
//   [K in keyof ReturnType<T>]: ReturnType<T>[K] extends SingleFieldCore<any>
//     ? ReturnType<T>[K]["value"]
//     : ReturnType<T>[K] extends ArrayFieldCore<any>
//     ? ReturnType<T>[K]["value"]
//     : ReturnType<T>[K] extends ObjectFieldCore<any> ? ReturnType<T>[K]["value"] : never;
// };
export class ArrayFieldCore<
  T extends (
    count: number
  ) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
> {
  symbol = "ArrayFieldCore" as const;
  _label: string;
  _name: string;
  _fields: ReturnType<T>[] = [];
  _field: T;

  constructor(props: ArrayFieldCoreProps<T>) {
    const { label, name, field } = props;
    this._label = label;
    this._name = name;
    this._field = field;
    this._fields = [];
  }
  get label() {
    return this._label;
  }
  get name() {
    return this._name;
  }
  get value(): ArrayFieldValue<T> {
    const r: ArrayFieldValue<T> = this._fields.map((field) => {
      return field.value;
    });
    return r;
  }
  setValue(values: any[]) {
    for (let i = 0; i < values.length; i += 1) {
      const v = values[i];
      const field = this._fields[i];
      field.setValue(v);
    }
    //     bus.emit(Events.StateChange, _state);
  }
  get fields(): (
    | SingleFieldCore<any>
    | ArrayFieldCore<any>
    | ObjectFieldCore<any>
  )[] {
    return this._fields;
  }
  async validate(): Promise<Result<ArrayFieldValue<T>>> {
    const results: ArrayFieldValue<T> = [];
    for (let i = 0; i < this._fields.length; i += 1) {
      const field = this._fields[i];
      const r = await field.validate();
      results.push(r);
    }
    return Result.Ok(results);
  }
  clear() {
    for (let i = 0; i < this._fields.length; i += 1) {
      const field = this._fields[i];
      field.clear();
    }
  }
  append() {
    let field = this._field(this._fields.length);
    // @ts-ignore
    this._fields.push(field);
    //     bus.emit(Events.StateChange, _state);
  }
  remove(fieldIndex: number) {
    this._fields.splice(fieldIndex, 1);
    //     bus.emit(Events.StateChange, _state);
  }
}
type ObjectValue<
  O extends Record<
    string,
    SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
  >
> = {
  [K in keyof O]: O[K] extends SingleFieldCore<any>
    ? O[K]["value"]
    : O[K] extends ArrayFieldCore<any>
    ? O[K]["value"][]
    : O[K] extends ObjectFieldCore<any>
    ? O[K]["value"]
    : never;
};
type ObjectFieldCoreProps<T> = FormFieldCoreProps & {
  fields: T;
};
enum ObjectFieldEvents {
  Change,
}
type TheObjectFieldCoreEvents<
  T extends Record<
    string,
    SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
  >
> = {
  [ObjectFieldEvents.Change]: ObjectValue<T>;
};
export class ObjectFieldCore<
  T extends Record<
    string,
    SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
  >
> {
  symbol = "ObjectFieldCore" as const;
  _label: string;
  _name: string;
  _fields: T;
  _bus = base<TheObjectFieldCoreEvents<T>>();

  get state() {
    const fields = Object.values(this._fields).map(
      (
        field: SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
      ) => {
        return {
          symbol: field.symbol,
          label: field.label,
          name: field.name,
          input:
            field.symbol === "SingleFieldCore"
              ? {
                  shape: field.input.shape,
                  value: field.input.value,
                }
              : null,
        };
      }
    );
    return {
      fields,
    };
  }

  constructor(props: ObjectFieldCoreProps<T>) {
    const { label, name, fields } = props;
    this._label = label;
    this._name = name;
    this._fields = fields;
  }
  get label() {
    return this._label;
  }
  get name() {
    return this._name;
  }
  get value(): ObjectValue<T> {
    const keys = Object.keys(this._fields) as Array<keyof T>;
    const result = keys.reduce((acc, key) => {
      acc[key] = this._fields[key].value;
      return acc;
    }, {} as ObjectValue<T>);
    return result;
  }
  setValue(values: Record<string, any>) {
    const keys = Object.keys(this._fields);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const field = this._fields[key];
      field.setValue(values[key]);
    }
  }
  get fields(): Record<
    string,
    SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>
  > {
    return this._fields;
  }
  async validate(): Promise<Result<ObjectValue<T>>> {
    const results: ObjectValue<T> = {} as ObjectValue<T>;
    const errors: BizError[] = [];
    const keys = Object.keys(this._fields);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const field = this._fields[key];
      const r = await field.validate();
      if (r.error) {
        errors.push(r.error);
        continue;
      }
      // @ts-ignore
      results[key] = r.data;
    }
    if (errors.length > 0) {
      return Result.Err(new BizError(errors.join("\n")));
    }
    return Result.Ok(results);
  }
  clear() {
    const keys = Object.keys(this._fields);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const field = this._fields[key];
      field.clear();
    }
  }
  handleValueChange(path: string, value: any) {
    const field = this._fields[path];
    if (!field) {
      return;
    }
    field.setValue(value);
    this._bus.emit(ObjectFieldEvents.Change, this.value);
  }
  toJSON() {
    return Object.keys(this._fields)
      .map((key) => {
        return {
          [key]: this._fields[key].value,
        };
      })
      .reduce((a, b) => {
        return { ...a, ...b };
      }, {});
  }
  destroy() {
    this._bus.destroy();
  }
  onChange(
    handler: Handler<TheObjectFieldCoreEvents<T>[ObjectFieldEvents.Change]>
  ) {
    return this._bus.on(ObjectFieldEvents.Change, handler);
  }
}

export type FormInputInterface<T> = {
  shape:
    | "number"
    | "string"
    | "boolean"
    | "select"
    | "multiple-select"
    | "custom"
    | "switch"
    | "checkbox"
    | "input"
    | "drag-upload"
    | "image-upload"
    | "upload"
    | "date-picker"
    | "list"
    | "form";
  // state: any;
  value: T;
  defaultValue: T;
  setValue: (v: T, extra?: Partial<{ silence: boolean }>) => void;
  onChange: (fn: (v: T) => void) => void;
  // onStateChange: (fn: (v: any) => void) => void;
};
