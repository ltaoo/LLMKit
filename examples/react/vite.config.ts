import path from "path";
import fs from "fs";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const pkg = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf-8")
    );
  } catch (err) {
    return null;
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@llmkit": path.resolve(__dirname, "../../src"),
      "@logic": path.resolve(__dirname, "../multiple-agent"),
      "@": path.resolve(__dirname, "./src"),
      axios: path.resolve(__dirname, "node_modules/axios"),
    },
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  define: {
    "process.global.__VERSION__": JSON.stringify(pkg ? pkg.version : "unknown"),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(filepath) {
          if (filepath.includes("node_modules") && !filepath.includes("hls")) {
            return "vendor";
          }
        },
      },
    },
  },
});
