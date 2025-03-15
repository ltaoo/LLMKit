import { Accessor, createSignal, onMount } from "solid-js";

type ViewModelFunction = (...args: any[]) => { state: any; ready: () => void; onStateChange: (handler: any) => any };
export function useViewModel<T extends ViewModelFunction>(
  fn: T,
  args: any[] = []
): [Accessor<ReturnType<T>["state"]>, ReturnType<T>] {
  const model = fn(...args);
  const [state, setState] = createSignal(model.state);

  model.onStateChange((v: any) => setState(v));
  onMount(() => {
    model.ready();
  });

  // @ts-ignore
  return [state, model];
}
