/**
 * @file 输入框
 */
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";

import { useInitialize } from "@/hooks/index";
import { InputCore } from "@/domains/ui/form/input";
import { connect } from "@/domains/ui/form/input/connect.web";
import { cn } from "@/utils/index";

const Input = (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: InputCore<any>;
  focus?: boolean;
  prefix?: ReactElement;
  className?: string;
}) => {
  const { store, prefix, focus } = props;

  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(store.state);

  useEffect(() => {
    const $input = ref.current;
    if (!$input) {
      return;
    }
    connect(store, $input);
    if (focus || store.autoFocus) {
      $input.focus();
    }
    store.setMounted();
  }, []);
  useInitialize(() => {
    store.onStateChange((nextState) => {
      setState(nextState);
    });
  });

  const {
    loading,
    value,
    placeholder,
    disabled,
    allowClear,
    autoComplete,
    autoFocus,
    type,
    tmpType,
  } = state;

  return (
    <div className="relative">
      <div className="absolute left-3 top-[50%] translate-y-[-50%] text-w-fg-1">
        {(() => {
          if (!prefix) {
            return null;
          }
          if (loading) {
            return <Loader2 className="w-5 h-5 animate-spin" />;
          }
          return prefix;
        })()}
      </div>
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          props.className
        )}
        // className={cn(
        //   "flex items-center h-10 w-full rounded-md leading-none border border-w-bg-2 bg-w-bg-3 text-w-fg-0 py-2 px-3 text-sm",
        //   "focus:outline-none focus:ring-2 focus:ring-fg-4 focus:ring-offset-2",
        //   "disabled:cursor-not-allowed disabled:opacity-50",
        //   "placeholder:text-w-fg-1",
        //   prefix ? "pl-10" : "",
        //   props.className
        // )}
        style={{
          verticalAlign: "bottom",
        }}
        value={value as string | number | readonly string[] | undefined}
        placeholder={placeholder}
        disabled={disabled}
        type={tmpType || type}
        autoComplete={!autoComplete ? "new-password" : "on"}
        autoFocus={autoFocus}
        autoCorrect="false"
        onChange={(event: React.ChangeEvent & { target: HTMLInputElement }) => {
          const { value: v } = event.target;
          // console.log("[COMPONENT]ui/input onchange", v);
          store.setValue(v);
        }}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Enter") {
            store.handleEnter();
          }
        }}
        onBlur={() => {
          // console.log("[COMPONENT]ui/input onBlur");
          store.handleBlur();
        }}
      />
      <div className="absolute right-3 top-[50%] translate-y-[-50%]">
        <div className="flex items-center space-x-4">
          {(() => {
            if (!allowClear) {
              return null;
            }
            if (!value) {
              return null;
            }
            return (
              <div
                className="p-1 rounded-full bg-w-fg-2 text-w-bg-0"
                onClick={(event) => {
                  event.stopPropagation();
                  store.clear();
                  store.focus();
                }}
              >
                <X className="w-2 h-2" />
              </div>
            );
          })()}
          {(() => {
            if (type !== "password") {
              return null;
            }
            if (tmpType) {
              return (
                <div
                  className="text-w-fg-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    store.hideText();
                  }}
                >
                  <EyeOff className="w-4 h-4" />
                </div>
              );
            }
            return (
              <div
                className="text-w-fg-2"
                onClick={(event) => {
                  event.stopPropagation();
                  store.showText();
                }}
              >
                <Eye className="w-4 h-4" />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
Input.displayName = "Input";

export { Input };
