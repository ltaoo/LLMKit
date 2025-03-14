import { createSignal, For, JSX, onMount, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ComicBookCore, PageFlipStep } from "@/biz/comic_book";
import { ComicBookPageCore } from "@/biz/comic_book/page";
import { ElementJQueryLikeCore, TreeNode } from "@/biz/comic_book/element";
import { PageFlipEffect } from "@/biz/comic_book/flip";
import { connect, connect2, connect4, connect5, bind } from "@/biz/comic_book/connect.web";

export function ComicPage(
  props: { book: ComicBookCore<any>; store: ComicBookPageCore<any> } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [state, setState] = createSignal(props.store.state);
  const [flip, setFlip] = createSignal(props.store.$flip?.state);
  const [book, setBook] = createSignal(props.book.state);

  let $wrap: HTMLDivElement | undefined;
  let $page: HTMLDivElement | undefined;
  let $inner: HTMLDivElement | undefined;

  props.store.onStateChange((state) => setState(state));
  props.book.onStateChange((state) => setBook(state));
  props.store.$flip?.onStateChange((state) => setFlip(state));

  //   return (
  //     <ElementJQueryLike store={props.store.$elm}>
  //       <div class="text-center text-3xl" style={{ "line-height": "500px" }}>
  //         {state().payload.text}
  //       </div>
  //     </ElementJQueryLike>
  //   );
  onMount(() => {
    if ($wrap && $page) {
      connect(props.store, { $page, $wrap });
      //       props.store.$flip?.methods.initialize();
    }
    // if ($inner) {
    //   console.log("[ComicPage]_onMount", $inner, props.store.$flip);
    //   if (props.store.$flip) {
    //     connect4(props.store.$flip, $inner);
    //   }
    // }
  });

  const inner = (
    <div
      ref={$page}
      id={`page-${state().page}`}
      data-side={state().side}
      classList={{
        "page turn-page relative overflow-hidden": true,
        "bg-white border": true,
      }}
    >
      {/* <div class="absolute h-[20px] bg-white text-black">{state().payload.text}</div> */}
      {props.children}
      {/* <div class="text-center text-3xl" style={{ "line-height": "500px" }}>
	      {state().payload.text}
	    </div> */}
    </div>
  );

  return (
    <div
      ref={$wrap}
      class="turn-page-wrapper"
      id={`wrapper-${state().page}`}
      data-page={state().page}
      // onTouchStart={(event) => {
      //   if (props.store.$flip) {
      //     props.store.$flip.methods._eventStart(event as any);
      //   }
      // }}
      // onTouchMove={(event) => {
      //   console.log("[ComicPage]_onTouchMove");
      //   if (props.store.$flip) {
      //     props.store.$flip.methods._eventMove(event as any);
      //   }
      // }}
      // onTouchEnd={(event) => {
      //   if (props.store.$flip) {
      //     props.store.$flip.methods._eventEnd();
      //   }
      // }}
    >
      <div
        class="__a inner_wrapper wrapper"
        data-page={props.store.page}
        onAnimationEnd={(event) => {
          console.log("[ComicPage]_onMount", props.store.$flip);
          const elm = event.currentTarget as HTMLElement;
          const $elm = ElementJQueryLikeCore({
            tag: "div",
            class: "wrapper",
            parent: null,
            name: "inner_wrapper",
            width: elm.clientWidth,
            height: elm.clientHeight,
          });
          bind(elm, $elm);
          props.book.methods._saveWrap2(props.store.page, $elm);
          if (props.store.$flip) {
            connect4(props.store.$flip, elm);
          }
        }}
      >
        <Show
          when={book().step === PageFlipStep.Turning && book().page && state().page === book().page}
          fallback={inner}
        >
          <div></div>
        </Show>
      </div>
      <div
        class="__a b_shadow"
        onAnimationEnd={(event) => {
          if (props.store.$flip) {
            connect5(props.store.$flip, event.target as HTMLElement);
          }
        }}
      ></div>
    </div>
  );
}

export function FlipPage(props: { store: PageFlipEffect } & JSX.HTMLAttributes<HTMLDivElement>) {
  let $wrap: HTMLDivElement | undefined;
  let $tmp: HTMLDivElement | undefined;
  let $page: HTMLDivElement | undefined;
  let $ashadow: HTMLDivElement | undefined;
  let $bshadow: HTMLDivElement | undefined;

  const [state, setState] = createSignal(props.store.$next?.state);

  onMount(() => {
    // console.log("[FLIP]onMount", props.store.$fwrapper, $wrap);
    if ($wrap && $page && $ashadow && $tmp) {
      //       props.store.methods.initialize();
      //       props.store.methods.initialize();
      connect2(props.store, {
        $wrap,
        $page,
        $tmp,
        $ashadow,
      });
    }
  });

  return (
    <div ref={$wrap} class="f_wrapper" style={{ display: "none" }}>
      <div ref={$tmp} class="f_tmp">
        <div ref={$page} class="f_page">
          <Show when={state()}>
            <div
              id={`page-${state().page}`}
              data-side={state().side}
              classList={{
                "__a page turn-page absolute inset-0 overflow-hidden": true,
                "bg-white border": true,
              }}
              style={{
                width: `${props.store.size.width}px`,
                height: `${props.store.size.height}px`,
                position: "absolute",
                inset: "0px auto auto 0px",
                "transform-origin": "0% 0%",
                transform:
                  props.store.side === "backward"
                    ? `rotate(270deg) translate3d(-${props.store.size.width}px, 0px, 0px)`
                    : `rotate(90deg) translate3d(0px, -${props.store.size.height}px, 0px)`,
              }}
              // onAnimationEnd={(event) => {
              //   const elm = ElementJQueryLikeCore({ name: "folding", parent: null, tag: "div", class: "page" });
              //   const $page = props.store.$elm;
              //   bind(event.currentTarget, elm);
              //   props.store.methods.setFolding(elm);
              // }}
            >
              {/* <div class="absolute h-[20px] bg-white text-black">{state().payload.text}</div> */}
	      {props.children}
              {/* <img class="w-full h-full object-cover" src={pictures[state().page]} /> */}
            </div>
          </Show>
          <div ref={$ashadow} class="a_shadow"></div>
        </div>
      </div>
    </div>
  );
}

export function ElementJQueryLike(props: { store: ElementJQueryLikeCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store, ...rest } = props;
  const [state, setState] = createSignal(store.state);

  store.onStateChange((state) => setState(state));

  const renderElement = (node: TreeNode) => {
    const Tag = node.tag;
    return (
      <Dynamic component={Tag}>
        <Show when={node.children} fallback={props.children}>
          <For each={node.children}>{(child) => renderElement(child)}</For>
        </Show>
      </Dynamic>
    );
  };

  return renderElement(state());
}
