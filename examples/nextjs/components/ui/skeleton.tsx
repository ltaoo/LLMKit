import React from "react";

import { cn } from "@/utils";

export const Skeleton = (props: {} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "animate-pulse w-full h-full rounded-md bg-w-fg-5",
        props.className
      )}
    />
  );
};
