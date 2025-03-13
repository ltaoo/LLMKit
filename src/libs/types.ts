export interface JSONArray extends Array<JSONValue> {}
export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | null;
export type JSONObject = { [Key in string]?: JSONValue };

export type MutableRecord<U> = {
  [SubType in keyof U]: {
    type: SubType;
  } & U[SubType];
}[keyof U];
