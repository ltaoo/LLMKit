import { useEffect, useMemo, useRef, useState } from "react";

export function useViewModel<
  T extends {
    state: any;
    ready: () => void;
    onStateChange: (handler: any) => void;
  }
>(builder: () => T): [T["state"], T] {
  const model = useMemo(() => {
    return builder();
  }, []);
  const [state, setState] = useState(model.state);

  useEffect(() => {
    model.onStateChange((v: any) => {
      console.log("[HOOK]model.onStateChange", v);
      setState(v);
    });
    model.ready();
  }, []);

  return [state, model];
}

/**
 * 初始化时
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useInitialize(fn: Function) {
  const initialized_ref = useRef(false);
  useState(() => {
    if (initialized_ref.current) {
      return;
    }
    initialized_ref.current = true;
    fn();
  });
}

export function useLatestValue(v: unknown) {
  const ref = useRef(v);
  useEffect(() => {
    ref.current = v;
  }, [v]);
  return ref;
}
