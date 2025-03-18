export type ValueInputInterface<T> = {
  shape:
    | "select"
    | "input"
    | "switch"
    | "drag-upload"
    | "image-upload"
    | "upload"
    | "date-picker"
    | "slider"
    | "list"
    | "form";
  // state: any;
  value: T;
  setValue: (v: T, extra?: Partial<{ silence: boolean }>) => void;
  onChange: (fn: (v: T) => void) => void;
  // onStateChange: (fn: (v: any) => void) => void;
};
