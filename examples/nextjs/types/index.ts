/* eslint-disable @typescript-eslint/no-explicit-any */
export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;
export type MutableRecord<U> = {
  [SubType in keyof U]: {
    type: SubType;
    data: U[SubType];
  };
}[keyof U];
export type Shift<T extends any[]> = ((...args: T) => void) extends (
  arg1: any,
  ...rest: infer R
) => void
  ? R
  : never;
export type Rect = {
  width: number;
  height: number;
  x: number;
  y: number;
  // scrollHeight: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};
export type JSONArray = Array<JSONValue>;
export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | null;
export type JSONObject = { [Key in string]?: JSONValue };
