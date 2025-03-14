export type ValueInputInterface<T> = {
  shape:
    | "switch"
    | "checkbox"
    | "select"
    | "input"
    | "drag-upload"
    | "image-upload"
    | "upload"
    | "date-picker"
    | "list"
    | "form";
  // state: any;
  value: T;
  setValue: (v: T, extra?: Partial<{ silence: boolean }>) => void;
  onChange: (fn: (v: T) => void) => void;
  // onStateChange: (fn: (v: any) => void) => void;
};
