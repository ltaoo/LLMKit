import { SwitchCore } from "@/domains/ui/switch";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";
import React, { useEffect, useState } from "react";

export function Switch(
  props: { store: SwitchCore } & React.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => setState(v));
  });

  return (
    <button
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        props.className
      )}
      type="button"
      role="switch"
      aria-checked={state.value}
      //       aria-required={required}
      data-state={state.value ? "checked" : "unchecked"}
      data-disabled={state.disabled ? "" : undefined}
      disabled={state.disabled}
      //       value={state.value}
      onClick={() => {
        store.toggle();
      }}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
        data-state={state.value ? "checked" : "unchecked"}
        data-disabled={state.disabled ? "" : undefined}
      ></span>
      <input
        id={store.id}
        type="checkbox"
        aria-hidden
        defaultChecked={state.value}
        tabIndex={-1}
        style={{
          ...props.style,
          //   ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
        }}
        // onChange={(event) => {
        //   console.log(event.currentTarget.checked);
        // }}
      />
    </button>
  );
}

export function SwitchLabel(
  props: { store: SwitchCore } & React.HTMLAttributes<HTMLLabelElement>
) {
  const { store } = props;

  const [label, setLabel] = useState(store.state.label);

  useEffect(() => {
    store.onLabelChange((v) => {
      setLabel(v);
    });
  }, []);

  return (
    <label
      className={cn(
        props.className,
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      )}
      htmlFor={store.id}
    >
      {label}
    </label>
  );
}
