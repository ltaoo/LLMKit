import { effect } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";

import { ZipFilePreviewLogic } from "./index";

export function Refresh(props: { store: ZipFilePreviewLogic } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  // 当 store 改变时，重新渲染
  effect(() => {
    console.log("store changed", store.state);
  });

  // @ts-ignore
  return <div>{props.children}</div>;
}
