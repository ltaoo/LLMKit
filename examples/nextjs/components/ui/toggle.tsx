import React, { useState } from "react";

import { ToggleCore } from "@/domains/ui/toggle";
import { useInitialize } from "@/hooks";

export const ToggleView = (
  props: { store: ToggleCore } & React.AllHTMLAttributes<HTMLDivElement>
) => {
  const { store } = props;
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => {
      setState(v);
    });
  });

  const { boolean } = state;
  if (boolean) {
    return <div>{props.children}</div>;
  }
  return null;
};
