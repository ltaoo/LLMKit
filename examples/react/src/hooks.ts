import { useState, useEffect, useMemo } from "react";

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
