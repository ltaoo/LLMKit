import React from "react";

export const Show = React.memo((props: { when: boolean; fallback?: React.ReactElement; children: React.ReactNode }) => {
  const { when, fallback = null, children } = props;
  if (when) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
});
