import { ViewComponent } from "@/store/types";
import { HomeLayout } from "@/pages/home/layout";
import { HomeIndexPage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { NotFoundPage } from "@/pages/notfound";
import { LLMAgentManagerPage } from "@/pages/home/llm_agent";
import { LLMProviderManagerPage } from "@/pages/home/llm_provider";
import { SettingsPage } from "@/pages/home/settings";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.home_layout": HomeLayout,
  "root.home_layout.index": HomeIndexPage,
  "root.home_layout.llm_agent": LLMAgentManagerPage,
  "root.home_layout.llm_provider": LLMProviderManagerPage,
  "root.home_layout.settings": SettingsPage,
  "root.login": LoginPage,
  "root.register": RegisterPage,
  "root.notfound": NotFoundPage,
};
