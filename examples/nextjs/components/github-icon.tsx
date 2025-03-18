import React from "react";

export function GithubIcon(props: {} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={props.className} style={props.style}>
      <div className="icons icons--github w-[56px] h-[56px]" />
    </div>
  );
}
