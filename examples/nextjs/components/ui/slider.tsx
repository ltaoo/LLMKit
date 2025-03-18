import React, { useState } from "react";

import { SliderCore } from "@/domains/ui/slider";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

export function Slider(
  props: { store: SliderCore } & React.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => setState(v));
  });

  return (
    <div className="relative flex items-center">
      <div className="w-[8px]"></div>
      <div className="relative flex w-full touch-none select-none items-center">
        <div
          className="__a relative flex-1 h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
          onAnimationEnd={(event) => {
            const { clientWidth } = event.currentTarget;
            store.setWidth(clientWidth);
          }}
        >
          <div
            className={cn("absolute h-full bg-primary")}
            style={{
              left: 0,
              right: `${100 - state.left}%`,
            }}
          ></div>
        </div>
        <div
          className={cn(
            "absolute block h-4 w-4 rounded-full border border-primary/50 -translate-x-1/2 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            state.disabled ? "pointer-events-none cursor-not-allowed" : ""
          )}
          style={{
            left: `${state.left}%`,
            backgroundColor: "",
          }}
          onPointerDown={(event) => {
            const { pageX: x, pageY: y } = event;
            store.ui.$pointer.handleMouseDown({ x, y });
            function handleMove(event: { pageX: number; pageY: number }) {
              const { pageX: x, pageY: y } = event;
              store.ui.$pointer.handleMouseMove({ x, y });
            }
            function handleUp(event: { pageX: number; pageY: number }) {
              const { pageX: x, pageY: y } = event;
              store.ui.$pointer.handleMouseUp({ x, y });
              document.removeEventListener("pointermove", handleMove);
              document.removeEventListener("pointerup", handleUp);
            }
            document.addEventListener("pointermove", handleMove);
            document.addEventListener("pointerup", handleUp);
          }}
        ></div>
      </div>
      <div className="ml-4 text-slate-500">{state.value}</div>
      {state.disabled ? (
        <div className="absolute inset-0 bg-white opacity-60  cursor-not-allowed"></div>
      ) : null}
    </div>
  );
}

export {};
