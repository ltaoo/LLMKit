import React, { useEffect, useRef, useState } from "react";
import { Image, ImageOff } from "lucide-react";

import { ImageCore, ImageStep } from "@/domains/ui/image";
import { connect } from "@/domains/ui/image/connect.web";
import { cn } from "@/utils";
import { useInitialize } from "@/hooks";

export const LazyImage = (
  props: {
    store: ImageCore;
    alt?: string;
  } & React.HTMLAttributes<HTMLImageElement>
) => {
  const { store } = props;

  const $img = useRef<HTMLDivElement>(null);
  // const image = new ImageCore({ width: 200, height: 100, src: props.src, alt: props.alt });
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      // console.log("[COMPONENT]LazyImage - image.onStateChange", nextState);
      setState(nextState);
    });
  });

  useEffect(() => {
    if (!$img.current) {
      return;
    }
    connect($img.current, store);
  }, []);
  // useEffect(() => {
  //   if (!props.src) {
  //     return;
  //   }
  //   store.updateSrc(props.src);
  // }, [props.src]);

  return (
    <div
      ref={$img}
      className={cn(
        props.className,
        "flex items-center justify-center bg-w-bg-0"
      )}
    >
      {(() => {
        if (state.step === ImageStep.Failed) {
          return <ImageOff className="w-8 h-8 text-w-fg-2" />;
        }
        if (state.step === ImageStep.Pending) {
          return <Image className="w-8 h-8 text-w-fg-2" />;
        }
        if ([ImageStep.Loading, ImageStep.Loaded].includes(state.step)) {
          return (
            <img
              className={props.className}
              // style={{
              //   objectFit: state.fit,
              // }}
              style={(() => {
                const ss: React.CSSProperties = {
                  objectFit: state.fit,
                };
                if (state.scale) {
                  ss.transform = `scale(${state.scale})`;
                }
                return ss;
              })()}
              src={state.src}
              alt={state.alt}
              onError={() => {
                store.handleError();
              }}
            />
          );
        }
        return null;
      })()}
    </div>
  );
};
