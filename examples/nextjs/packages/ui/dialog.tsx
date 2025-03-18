/**
 * @file 弹窗 组件
 */
import React, { useState } from "react";

import { DialogCore } from "@/domains/ui/dialog";
import { Presence } from "@/components/ui/presence";
import { Button } from "@/components/ui/button";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

import { Portal as PortalPrimitive } from "./portal";

const Root = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLElement>
) => {
  return <>{props.children}</>;
};

const Portal = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLElement>
) => {
  const { store } = props;

  return (
    <Presence store={store.$present}>
      <PortalPrimitive>
        <div className={props.className}>{props.children}</div>
      </PortalPrimitive>
    </Presence>
  );
};

const Overlay = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLDivElement>
) => {
  const { store } = props;

  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      setState(nextState);
    });
  });

  return (
    <div
      data-state={getState(state.open)}
      className={cn(props.className)}
      onClick={() => {
        store.hide();
      }}
    />
  );
};

const Content = (
  props: {
    store: DialogCore;
  } & React.AllHTMLAttributes<HTMLElement>
) => {
  const { store } = props;
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      setState(nextState);
    });
  });

  return (
    <div className={cn(props.className)} data-state={getState(state.open)}>
      {props.children}
    </div>
  );
};

const Description = (props: {} & React.AllHTMLAttributes<HTMLElement>) => {
  return <div className={props.className} {...props} />;
};

const Close = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLElement>
) => {
  const { store } = props;
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((nextState) => {
      setState(nextState);
    });
  });

  return (
    <div
      className={props.className}
      data-state={getState(state.open)}
      onClick={() => {
        props.store.hide();
      }}
    >
      {props.children}
      <span className="sr-only">Close</span>
    </div>
  );
};

const Header = (props: {} & React.AllHTMLAttributes<HTMLElement>) => {
  return <div className={cn(props.className)}>{props.children}</div>;
};

const Footer = (props: {} & React.AllHTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(props.className)}>{props.children}</div>;
};

const Title = (props: {} & React.AllHTMLAttributes<HTMLElement>) => {
  return <div className={cn(props.className)}>{props.children}</div>;
};

const Submit = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLButtonElement>
) => {
  const { store } = props;

  return (
    <Button variant="default" store={store.okBtn}>
      {props.children}
    </Button>
  );
};

const Cancel = (
  props: { store: DialogCore } & React.AllHTMLAttributes<HTMLButtonElement>
) => {
  const { store } = props;

  return (
    <Button
      variant="secondary"
      className={props.className}
      store={store.cancelBtn}
    >
      {props.children}
    </Button>
  );
};

function getState(open: boolean) {
  return open ? "open" : "closed";
}

export {
  Root,
  Portal,
  Header,
  Title,
  Content,
  Description,
  Close,
  Overlay,
  Footer,
  Submit,
  Cancel,
};
