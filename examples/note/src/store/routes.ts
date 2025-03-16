import { PageKeysType, build } from "@/domains/route_view/utils";

/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    children: {
      home_layout: {
        title: "HomeLayout",
        pathname: "/home",
        children: {
          index: {
            title: "Home",
            pathname: "/home/index",
            options: {
              require: [],
            },
          },
          llm_agent: {
            title: "LLMAgent",
            pathname: "/home/llm_agent",
          },
          llm_provider: {
            title: "LLMProvider",
            pathname: "/home/llm_provider",
          },
          settings: {
            title: "Settings",
            pathname: "/home/settings",
          },
        },
      },
      chat: {
        title: "对话",
        pathname: "/chat",
      },
      login: {
        title: "登录",
        pathname: "/login",
      },
      register: {
        title: "注册",
        pathname: "/register",
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
    },
  },
};
export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

// @ts-ignore
globalThis.__routes_with_pathname__ = routesWithPathname;
// @ts-ignore
globalThis.__routes__ = routes;
