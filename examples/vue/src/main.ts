import { createApp } from "vue";

import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import ScrollView from "@/components/ui/ScrollView.vue";
import Show from "@/components/ui/Show.vue";

import App from "./App.vue";

import "tailwindcss/tailwind.css";
import "./style.css";

const app = createApp(App);
app.mount("#app");
