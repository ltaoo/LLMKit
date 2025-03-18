/**
 * @file 小黑块 提示
 */
import React, { useEffect, useState } from "react";

import * as ToastPrimitive from "@/packages/ui/toast";
// import { useInitialize } from "@/hooks/index";
import { ToastCore } from "@/domains/ui/toast";
import { cn } from "@/utils/index";

export const Toast = (props: { store: ToastCore }) => {
  const { store } = props;

  const [state, setState] = useState(store.state);
  const [state2, setState2] = useState(store.$present.state);

  useEffect(() => {
    store.onStateChange((v) => {
      setState(v);
    });
    store.$present.onStateChange((v) => setState2(v));
  }, []);
  // useInitialize(() => {
  //   store.onStateChange((v) => {
  //     setState(v);
  //   });
  //   store.$present.onStateChange((v) => setState2(v));
  // });

  const { texts } = state;

  return (
    <ToastPrimitive.Root store={store}>
      <ToastPrimitive.Portal
        className={cn(
          "fixed inset-0",
          state2.enter ? "animate-in fade-in" : "",
          state2.exit ? "animate-out fade-out" : ""
        )}
        store={store}
      >
        <ToastPrimitive.Content
          store={store}
          className={cn(
            "grid gap-4 rounded-lg bg-w-bg-4 text-w-bg-0 dark:text-w-fg-0 p-6 duration-200 sm:max-w-lg sm:rounded-lg",
            state2.enter ? "animate-in fade-in sm:zoom-in-90" : "",
            state2.exit ? "animate-out fade-out" : ""
          )}
        >
          {texts.map((text, i) => {
            return (
              <div key={i} className="text-center">
                {text}
              </div>
            );
          })}
        </ToastPrimitive.Content>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Root>
  );
};

// const Overlay = (props: { store: ToastCore } & React.AllHTMLAttributes<HTMLDivElement>) => {
//   const { store } = props;

//   const [state, setState] = useState(store.$present.state);

//   useInitialize(() => {
//     store.$present.onStateChange((v) => setState(v));
//   });

//   return (
//     <ToastPrimitive.Overlay
//       store={store}
//       className={cn(
//         "fixed inset-0 z-51 bg-black/50 backdrop-blur-sm transition-all duration-100",
//         // "data-[state=exit]:animate-out data-[state=enter]:fade-in data-[state=exit]:fade-out",
//         state.enter ? "animate-in fade-in" : "",
//         state.exit ? "animate-out fade-out" : "",
//         props.className
//       )}
//     />
//   );
// };
