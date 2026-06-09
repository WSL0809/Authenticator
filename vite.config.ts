import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import path from "node:path";

const entry = process.env.VITE_ENTRY || "src/popup.ts";
const name = process.env.VITE_NAME || "popup";
const globalName = `Authenticator${name.replace(
  /(^|-)([a-z])/g,
  (_, __, letter) => letter.toUpperCase()
)}`;

export default defineConfig({
  plugins: [vue(), svgLoader()],
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "argon2-browser": path.resolve(
        __dirname,
        "node_modules/argon2-browser/dist/argon2-bundled.min.js"
      ),
    },
  },
  build: {
    assetsInlineLimit: 100 * 1024,
    emptyOutDir: false,
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, entry),
      name: globalName,
      formats: ["iife"],
      fileName: () => `${name}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
