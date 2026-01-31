import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  // Use root path for Netlify, subpath for GitHub Pages
  // Set VITE_DEPLOY_TARGET=netlify for Netlify builds
  base: process.env.VITE_DEPLOY_TARGET === 'netlify' ? '/' : '/PreflopLab/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
