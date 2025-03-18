import path from "path";
import fs from "fs";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const pkg = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"));
  } catch (err) {
    return null;
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@llmkit": path.resolve(__dirname, "../../src"),
      "@logic": path.resolve(__dirname, "../multiple-agent"),
      axios: path.resolve(__dirname, "node_modules/axios"),
    },
  },
  define: {
    "process.global.__VERSION__": JSON.stringify(pkg ? pkg.version : "unknown"),
  },
});
