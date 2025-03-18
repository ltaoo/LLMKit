import { request_factory } from "@/domains/request/utils";
import { Result } from "@/domains/result";

export const request = request_factory({
  hostnames: {
    prod: "",
  },
  debug: true,
  process<T>(v: Result<{ code: number; msg: string; data: T }>) {
	console.log("proess by ", v);
    if (v.error) {
      return Result.Err(v.error.message);
    }
    const { code, msg, data } = v.data;
    if (code !== 0) {
      return Result.Err(msg, code);
    }
    return Result.Ok(data);
  },
});
