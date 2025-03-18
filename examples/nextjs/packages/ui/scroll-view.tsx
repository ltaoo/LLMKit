import React, { useEffect, useRef, useState } from "react";

import { useInitialize } from "@/hooks/index";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { connectScroll, connectIndicator } from "@/domains/ui/scroll-view/connect.web";

export const Root = React.memo((props: { store: ScrollViewCore } & React.HTMLAttributes<HTMLDivElement>) => {
  const { store, children, ...rest } = props;

  const elmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const elm = elmRef.current;
    if (!elm) {
      return;
    }
    store.setRect({
      width: elm.clientWidth,
      height: elm.clientHeight,
    });
    store.setMounted();
    connectScroll(store, elm);
    return () => {
      store.destroy();
    };
  }, []);

  return (
    <div
      ref={(e) => {
        elmRef.current = e;
      }}
      className={props.className}
      style={props.style}
      onClick={props.onClick}
      // onTouchStart={(e) => {
      //   store.handlePointDown(e as any);
      // }}
    >
      {props.children}
    </div>
  );
});
/**
 * 下拉刷新指示器
 */
export const Indicator = React.memo((props: { store: ScrollViewCore } & React.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  const elmRef = useRef<HTMLDivElement | null>(null);
  // const [visible, setVisible] = useState(true);

  useEffect(() => {
    const $elm = elmRef.current;
    if (!$elm) {
      return;
    }
    // 在这里里面会监听滚动逻辑，并改变 height
    connectIndicator(store, $elm);
    if (store.needHideIndicator) {
      store.hideIndicator();
    }
  }, []);

  return (
    <div
      ref={(e) => {
        elmRef.current = e;
      }}
      className={props.className}
      style={{ height: 0 }}
    >
      {props.children}
    </div>
  );
});
export const Progress = React.memo((props: { store: ScrollViewCore } & React.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  const ref = useRef<null | HTMLDivElement>(null);

  useInitialize(() => {
    store.inDownOffset(() => {
      // console.log("[]Progress - store.onInOffset", ref);
      if (!ref.current) {
        return;
      }
      ref.current.style.display = "block";
    });
    store.onPullToRefresh(() => {
      // console.log("[]Progress - store.onPullToRefresh");
      if (!ref.current) {
        return;
      }
      ref.current.style.display = "none";
    });
  });

  return (
    <div ref={ref} className={props.className}>
      {props.children}
    </div>
  );
});

export const Loading = React.memo((props: { store: ScrollViewCore } & React.HTMLAttributes<HTMLDivElement>) => {
  const { store } = props;

  const ref = useRef<null | HTMLDivElement>(null);

  useInitialize(() => {
    store.inDownOffset(() => {
      // console.log("[]Loading - store.onInOffset", ref);
      if (!ref.current) {
        return;
      }
      ref.current.style.display = "none";
    });
    store.onPullToRefresh(() => {
      // console.log("[]Loading - store.onPullToRefresh", ref);
      if (!ref.current) {
        return;
      }
      ref.current.style.display = "inline-block";
    });
  });

  return (
    <div ref={ref} className={props.className} style={{ display: "none" }}>
      {props.children}
    </div>
  );
});
