import * as React from "react";

import { cn } from "@/utils";

export const Label = (props: React.HTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      props.className
    )}
    {...props}
  />
);
