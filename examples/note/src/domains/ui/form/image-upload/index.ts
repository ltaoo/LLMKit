import { base, Handler } from "@/domains/base";
import { ImageCore } from "@/domains/ui/image";
import { DragZoneCore } from "@/domains/ui/drag-zone";
import { readFileAsURL } from "@/utils/browser";

type ImageUploadPropsCore = {
  tip?: string;
};

// export function ImageUploadCore(props: ImageUploadPropsCore) {
//   const $image = new ImageCore({});
//   const $upload = new DragZoneCore();

//   return {
//     shape: "image-upload",
//   };
// }

export function ImageUploadCore(props: ImageUploadPropsCore) {
  let _url = "";
  let _file: null | File = null;

  const $zone = new DragZoneCore({ tip: props.tip });
  const $img = new ImageCore({});

  $zone.onChange(async (files) => {
    const file = files[0];
    if (!file) {
      return;
    }
    // @todo readFileAsURL 该怎么来呢?
    const r = await readFileAsURL(file);
    if (r.error) {
      return;
    }
    _file = file;
    _url = r.data;
    $img.setLoaded();
    $img.setURL(_url);
    bus.emit(Events.Change, _url);
    bus.emit(Events.StateChange, { ..._state });
  });
  const _state = {
    get url() {
      return _url;
    },
    get file() {
      return _file;
    },
  };
  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: string;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "image-upload" as const,
    state: _state,
    value: _url,
    ui: {
      zone: $zone,
      img: $img,
    },
    setValue(url: string) {
      _url = url;
      bus.emit(Events.Change, _url);
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ImageUploadCore = ReturnType<typeof ImageUploadCore>;
