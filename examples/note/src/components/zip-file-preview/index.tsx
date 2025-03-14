import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { Loader } from "lucide-solid";

import { ViewComponentProps } from "@/store/types";
import { render_comic_file } from "@/biz/services";
import { base, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request";
import { ImageCore } from "@/domains/ui";
import { LazyImage } from "@/components/ui/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { connect } from "./connect.web";
import { effect } from "solid-js/web";

export function ZipFilePreviewLogic(props: { comic_id: number; file_path: string } & ViewComponentProps) {
  const { app, client, comic_id, file_path } = props;

  const _self = {};

  const ui = {
    file: null as null | ImageCore,
  };
  const services = {
    load: new RequestCore(render_comic_file, { client }),
  };
  const methods = {};
  const _state = {
    get response() {
      return services.load.response;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  services.load.onStateChange(() => {
    if (!services.load.response) {
      return;
    }
    // console.log("services.load.response", services.load.response);
    if (services.load.response.mime_type === "image/jpeg") {
      const base64 = services.load.response.base64;
      console.log("[COMPONENT]zip-file-preview - get image base64", services.load.response, file_path);
      const $img = new ImageCore({ src: base64 });
      $img.onMounted(() => {
        $img.showWithBase64(base64);
      });
      ui.file = $img;
    }
    bus.emit(Events.StateChange, { ..._state });
  });

  return {
    state: _state,
    services,
    ui,
    comic_id,
    file_path,
    ready() {
      if (services.load.loading) {
        return;
      }
      services.load.run({ comic_id, file_path });
    },
    destroy() {
      bus.destroy();
      services.load.destroy();
      if (ui.file) {
        ui.file.destroy();
        ui.file = null;
      }
    },
    onStateChange: (handler: Handler<TheTypesOfEvents[Events.StateChange]>) => {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ZipFilePreviewLogic = ReturnType<typeof ZipFilePreviewLogic>;

export function ZipFilePreview(props: { store: ReturnType<typeof ZipFilePreviewLogic> }) {
  const { store } = props;

  let $container: HTMLDivElement | undefined = undefined;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((state) => setState(state));

  onMount(() => {
    if (!$container) {
      return;
    }
    connect($container, store);
    store.ready();
  });
  // 当 store 改变时，调用 setState
  effect(() => {
    // store.destroy();
    console.log("store changed", store.file_path, store.state);
    setState(store.state);
    if (store.ui.file) {
      store.ui.file.refresh();
    }
  });

  return (
    <div ref={$container} class="relative min-h-[480px]">
      <Show
        when={state().response}
        fallback={
          <div class="absolute inset-0 w-full min-h-[480px] bg-gray-200">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Loader class="w-8 h-8 animate-spin" />
            </div>
          </div>
        }
      >
        <Switch>
          <Match when={state().response?.mime_type === "image/jpeg"}>
            <LazyImage store={store.ui.file as ImageCore} />
          </Match>
        </Switch>
      </Show>
    </div>
  );
}
