import { createSignal, For, Match, Switch } from "solid-js";

import { InputCore } from "@/domains/ui/form/input";
import { ObjectFieldCore } from "@/domains/ui/formv2";

import { Input } from "./input";

export function DynamicForm(props: { store: ObjectFieldCore<any> }) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onChange((value) => {
    console.log("[COMPONENT]ui/dynamic-form - onChange", value);
  });

  return (
    <div>
      <For each={state().fields}>
        {(field) => {
          return (
            <div class="flex flex-row gap-2">
              <div>{field.label}</div>
              <div>
                {(() => {
                  if (field.symbol === "SingleFieldCore") {
                    if (field.input?.shape === "input") {
                      return (
                        <input
                          value={field.input?.value}
                          onChange={(event) => {
                            store.handleValueChange(field.name, event.target.value);
                          }}
                        />
                      );
                    }
                    if (field.input?.shape === "checkbox") {
                      return (
                        <input
                          type="checkbox"
                          checked={field.input?.value}
                          value={field.input?.value}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            store.handleValueChange(field.name, checked);
                          }}
                        />
                      );
                    }
                  }
                  return <div>Unknown</div>;
                })()}
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
