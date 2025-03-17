/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal, onMount } from "solid-js";

import { ViewComponent } from "@/store/types";
import { PageKeys } from "@/store/routes";
import { KeepAliveRouteView } from "@/components/ui";
import { cn } from "@/utils/index";

export const HomeLayout: ViewComponent = (props) => {
  const { app, history, client, storage, pages, view } = props;

  const [subViews, setSubViews] = createSignal(view.subViews);
  const [activeTab, setActiveTab] = createSignal("notes");

  view.onSubViewsChange((v) => {
    setSubViews(v);
  });

  const navItems: { id: string; icon: string; label: string; path: PageKeys }[] = [
    { id: "notes", icon: "📝", label: "笔记", path: "root.home_layout.index" },
    // { id: "search", icon: "🔍", label: "搜索" },
    { id: "llm", icon: "🤖", label: "LLM厂商", path: "root.home_layout.llm_provider" },
    { id: "agent", icon: "🎯", label: "Agent", path: "root.home_layout.llm_agent" },
    // { id: "settings", icon: "⚙️", label: "设置", path: "root.home_layout.settings" },
  ];

  return (
    <div class="flex w-full h-full bg-white">
      <div class="w-16 h-full border-r border-gray-200 flex flex-col items-center py-4 bg-gray-50">
        <For each={navItems}>
          {(item) => (
            <button
              class={cn(
                "w-12 h-12 mb-2 rounded-lg flex flex-col items-center justify-center",
                "hover:bg-gray-200 transition-colors duration-200",
                activeTab() === item.id ? "bg-gray-200" : "bg-transparent"
              )}
              onClick={() => {
                setActiveTab(item.id);
                props.history.push(item.path);
              }}
            >
              <span class="text-xl">{item.icon}</span>
              <span class="text-xs mt-1">{item.label}</span>
            </button>
          )}
        </For>
      </div>

      <div class="flex-1">
        <div class="relative w-full h-full">
          <For each={subViews()}>
            {(subView, i) => {
              const routeName = subView.name;
              const PageContent = pages[routeName as Exclude<PageKeys, "root">];
              return (
                <KeepAliveRouteView
                  class={cn(
                    "absolute inset-0",
                    "data-[state=open]:animate-in data-[state=open]:fade-in",
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out"
                  )}
                  store={subView}
                  index={i()}
                >
                  <PageContent
                    app={app}
                    client={client}
                    storage={storage}
                    pages={pages}
                    history={history}
                    view={subView}
                  />
                </KeepAliveRouteView>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};
