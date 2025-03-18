/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from "react";

export function Container(
  props: {
    onMount: (elm: HTMLDivElement) => void;
  } & React.HTMLAttributes<HTMLDivElement>
) {
  const { onMount, children, ...rest } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    props.onMount(ref.current);
  }, []);

  return (
    <div ref={ref} {...rest}>
      {props.children}
    </div>
  );
}
