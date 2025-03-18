import { InputCore } from "./index";

export function connect(store: InputCore<string | number | readonly string[] | undefined>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
}
