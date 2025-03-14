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
