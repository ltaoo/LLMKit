// import { DialogCore } from "@/domains/ui";
// import * as DialogPrimitive from "@/packages/ui/dialog";
// import React from "react";

// export const Drawer = (props: { store: DialogCore } & React.HTMLAttributes<HTMLDivElement>) => {
//   const { store, children } = props;
//   return (
//     <DialogPrimitive.Root store={store}>
//       <DialogPrimitive.Portal store={store}>
//         <DialogPrimitive.Content
//           store={store}
//           onPointerDown={onPress}
//           onPointerDownOutside={(e) => {
//             onPointerDownOutside?.(e);
//             if (!modal) {
//               e.preventDefault();
//               return;
//             }
//             if (keyboardIsOpen.current) {
//               keyboardIsOpen.current = false;
//             }
//             e.preventDefault();
//             onOpenChange?.(false);
//             if (!dismissible || openProp !== undefined) {
//               return;
//             }

//             closeDrawer();
//           }}
//           onPointerMove={onDrag}
//           onPointerUp={onRelease}
//           ref={composedRef}
//           style={
//             snapPointsOffset && snapPointsOffset.length > 0
//               ? ({
//                   "--snap-point-height": `${snapPointsOffset[0]!}px`,
//                   ...style,
//                 } as React.CSSProperties)
//               : style
//           }
//         >
//           {children}
//         </DialogPrimitive.Content>
//       </DialogPrimitive.Portal>
//     </DialogPrimitive.Root>
//   );
// };

export function placeholder() {
  return null;
}
