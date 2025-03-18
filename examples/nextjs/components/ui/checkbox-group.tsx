import React, { useState } from "react";

import { CheckboxCore } from "@/domains/ui/checkbox";
import { CheckboxGroupCore } from "@/domains/ui/checkbox/group";
import { cn } from "@/utils";
import { useInitialize } from "@/hooks";

export const CheckboxOption = (
  props: {
    label: string;
    store: CheckboxCore;
  } & React.HTMLAttributes<HTMLDivElement>
) => {
  const { label, store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      console.log(
        "[COMPONENT]CheckboxGroup - Option store.onStateChange",
        nextState
      );
      setState(nextState);
    });
  });

  return (
    <div
      className={cn(
        "flex justify-center items-center py-1 px-2 mb-2 rounded-lg text-w-fg-1 border border-w-fg-1 leading-none",
        state.checked ? "bg-w-bg-active text-w-fg-1" : ""
      )}
      onClick={() => {
        store.toggle();
      }}
    >
      <div className="text-sm leading-tight">{label}</div>
    </div>
  );
};

export const CheckboxGroup = <T extends Record<string, unknown>>(
  props: { store: CheckboxGroupCore<T> } & React.HTMLAttributes<HTMLDivElement>
) => {
  const { store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      setState(nextState);
    });
  });

  return (
    <div className="flex flex-wrap space-x-2">
      {state.options.map((option) => {
        const { label, core } = option;
        return <CheckboxOption key={label} store={core} label={label} />;
      })}
    </div>
  );
};
