import React, { useState } from "react";

import { DragZoneCore } from "@/domains/ui/drag-zone";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

export function DragZone(
  props: { store: DragZoneCore } & React.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => setState(v));
  });

  return (
    <div
      className={cn(
        "overflow-hidden absolute inset-0 rounded-sm outline-slate-300 outline-2",
        state.hovering ? "outline" : "outline-dashed"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        store.handleDragover();
      }}
      onDragLeave={() => {
        store.handleDragleave();
      }}
      onDrop={(event) => {
        event.preventDefault();
        store.handleDrop(Array.from(event.dataTransfer?.files || []));
      }}
    >
      <div
        className="w-full h-full"
        style={{ display: state.selected ? "block" : "none" }}
      >
        {props.children}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        // style={{ display: state().selected ? "none" : "block" }}
      >
        <div className="flex items-center justify-center h-full p-4 text-center">
          <div
            className="text-[14px]"
            style={{ display: !state.selected ? "block" : "none" }}
          >
            {state.tip}
          </div>
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(event) => {
              store.handleDrop(Array.from(event.currentTarget.files || []));
            }}
          />
        </div>
      </div>
    </div>
  );
}
