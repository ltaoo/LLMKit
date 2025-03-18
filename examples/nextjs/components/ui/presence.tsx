/**
 * @file 控制内容显隐的组件
 */
import React, { useEffect, useState } from "react";

import { Show } from "@/packages/ui/show";
// import { useInitialize } from "@/hooks/index";
import { PresenceCore } from "@/domains/ui/presence";
import { cn } from "@/utils/index";

export const Presence = (
  props: {
    store: PresenceCore;
    enterClassName?: string;
    exitClassName?: string;
  } & React.AllHTMLAttributes<HTMLElement>
) => {
  const { store, enterClassName, exitClassName } = props;

  const [state, setState] = useState(store.state);

  useEffect(() => {
    store.onStateChange((v) => setState(v));
  });
  // useInitialize(() => {
  //   store.onStateChange((v) => setState(v));
  // });

  const { visible, mounted } = state;

  return (
    <Show when={mounted}>
      <div
        className={cn(
          "presence",
          state.enter && enterClassName ? enterClassName : "",
          state.exit && exitClassName ? exitClassName : "",
          props.className
        )}
        role="presentation"
        style={{ display: visible ? "block" : "none" }}
        // data-state={visible ? "open" : "closed"}
        // onAnimationEnd={() => {
        //   store.unmount();
        // }}
      >
        {props.children}
      </div>
    </Show>
  );
};
