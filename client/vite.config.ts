import { defineConfig, loadEnv } from "vite"
import type { Plugin } from "vite"
import react from "@vitejs/plugin-react"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

function copyPlugin(): Plugin {
  return {
    name: "vite-plugin-copy",
    apply: "build",
    closeBundle() {
      const src = path.resolve(import.meta.dirname, "dist/index.html")
      const destDir = path.resolve(import.meta.dirname, "dist/explore")
      fs.mkdirSync(destDir, { recursive: true })
      fs.copyFileSync(src, path.join(destDir, "index.html"))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")
  return {
    plugins: [react(), copyPlugin()],
    resolve: {
      alias: [{ find: /^events$/, replacement: require.resolve("events/") }],
    },
    define: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || mode),
      PORT: JSON.stringify(process.env.PORT || env.PORT || ""),
    },
    build: {
      sourcemap: true,
      outDir: "dist",
    },
    server: {
      port: 5555,
    },
  }
})
