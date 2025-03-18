import React, { useState } from "react";

import { ImageUploadCore } from "@/domains/ui/form/image-upload/index";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

import { DragZone } from "./drag-zone";
import { LazyImage } from "./image";

export function ImageUpload(
  props: { store: ImageUploadCore } & React.HTMLAttributes<HTMLDivElement>
) {
  const { store } = props;

  const [state, setState] = useState(store.state);
  useInitialize(() => {
    store.onStateChange((v) => setState(v));
  });

  return (
    <div className={cn(props.className, "relative")}>
      {state.url ? (
        <div className="absolute inset-0 h-full">
          <LazyImage className="h-full object-cover" store={store.ui.img} />
        </div>
      ) : null}
      <DragZone store={store.ui.zone}></DragZone>
    </div>
  );
}
