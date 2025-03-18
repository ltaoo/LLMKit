import React, { useState } from "react";

import { InputCore } from "@/domains/ui/form/input";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

export function Textarea(
  props: {
    store: InputCore<string>;
  } & React.HTMLAttributes<HTMLTextAreaElement>
) {
  const { store, ...restProps } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => setState(v));
  });

  return (
    <textarea
      className={cn(
        "flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        props.className
      )}
      value={state.value}
      placeholder={state.placeholder}
      disabled={state.disabled}
      onInput={(event: { currentTarget: HTMLTextAreaElement }) => {
        const { value } = event.currentTarget;
        store.setValue(value);
      }}
      {...restProps}
    />
  );
}
