import { createPortal } from "react-dom";

import { useInitialize } from "@/hooks";
import { useEffect } from "react";

export function Portal(props: React.AllHTMLAttributes<HTMLElement>) {
  // useInitialize(() => {
  //   createPortal(props.children, document.body);
  // });
  // useInitialize(() => {
  //   console.log("create portal", props.children);
  //   const $e = document.createElement("div");
  //   document.body.appendChild($e);
  // });
  // console.log("[COMPONENT]Portal - render");

  return createPortal(<div className="portal">{props.children}</div>, document.body);
}
