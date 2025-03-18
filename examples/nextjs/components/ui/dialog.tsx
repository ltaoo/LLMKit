/**
 * @file 弹窗 组件
 */
import React, { useState } from "react";
import { X } from "lucide-react";

import { useInitialize } from "@/hooks/index";
import { Show } from "@/packages/ui/show";
import * as DialogPrimitive from "@/packages/ui/dialog";
import { DialogCore } from "@/domains/ui/dialog";
import { cn } from "@/utils/index";

export const Dialog = (
  props: {
    store: DialogCore;
  } & React.AllHTMLAttributes<HTMLElement>
) => {
  const { store } = props;

  const [state, setState] = useState(store.state);
  const [state2, setState2] = useState(store.$present.state);

  useInitialize(() => {
    store.onStateChange((v) => setState(v));
    store.$present.onStateChange((v) => setState2(v));
  });

  const { title, footer, cancel } = state;

  return (
    <DialogPrimitive.Root store={store}>
      <DialogPrimitive.Portal
        store={store}
        className="fixed inset-0 z-50 flex items-start justify-center sm:items-center"
      >
        <DialogPrimitive.Overlay
          store={store}
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "transition-all duration-200",
            state2.enter ? "animate-in fade-in" : "",
            state2.exit ? "animate-out fade-out" : ""
          )}
        />
        <DialogPrimitive.Content
          store={store}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            // props.className
          )}
          // className={cn(
          //   "fixed left-[50%] top-[30%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
          //   // "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          //   // "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          //   "bg-w-bg-0 border-w-bg-2",
          //   state2.enter
          //     ? "animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]"
          //     : "",
          //   state2.exit
          //     ? "animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-[48%]"
          //     : ""
          // )}
          // className={cn(
          //   "fixed z-50 grid w-full gap-4 rounded-b-lg bg-white p-6 sm:max-w-lg sm:rounded-lg",
          //   "sm:zoom-in-90",
          //   "animate-in data-[state=open]:fade-in-90",
          //   "data-[state=closed]:animate-out data-[state=closed]:fade-out"
          // )}
        >
          <DialogPrimitive.Header className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title
              className={cn(
                "text-lg text-w-fg-0 font-semibold leading-none tracking-tight"
              )}
            >
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description
              className={cn("text-sm text-muted-foreground")}
            >
              {props.children}
            </DialogPrimitive.Description>
          </DialogPrimitive.Header>
          <Show when={!!footer}>
            <DialogPrimitive.Footer
              className={cn(
                "flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0"
              )}
            >
              <DialogPrimitive.Submit store={store}>
                确定
              </DialogPrimitive.Submit>
              <Show when={!!cancel}>
                <DialogPrimitive.Cancel store={store}>
                  取消
                </DialogPrimitive.Cancel>
              </Show>
            </DialogPrimitive.Footer>
          </Show>
          <DialogPrimitive.Close
            store={store}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            // className={cn(
            //   "absolute top-4 right-4 cursor-pointer rounded-full",
            //   "opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none",
            //   "dark:focus:ring-slate-400 dark:focus:ring-offset-black-900",
            //   "data-[state=open]:bg-w-bg-0",
            //   state2.enter ? "animate-in bg-w-bg-0" : "",
            //   state2.exit ? "" : ""
            // )}
          >
            <X width={15} height={15} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
