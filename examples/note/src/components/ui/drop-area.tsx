import { createSignal, JSX, Show } from "solid-js";
import { listen } from "@tauri-apps/api/event";

import { DragZoneCore } from "@/domains/ui/drag-zone";

export function DropArea(props: { store: DragZoneCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => setState(v));

  listen("tauri://drag-enter", () => {
    store.handleDragover();
  });
  listen<{ paths: string[] }>("tauri://drag-drop", (event) => {
    store.handleDrop(event.payload.paths);
  });
  listen("tauri://drag-leave", () => {
    store.handleDragleave();
  });

  return (
    <div
      classList={{
        "absolute inset-0": true,
        "outline-dashed outline-gray-500": state().hovering,
      }}
    >
      {props.children}
    </div>
  );
}
