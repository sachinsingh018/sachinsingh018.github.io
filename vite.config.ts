import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// User site on GitHub Pages, served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  // The prerender build bundles every dependency so it runs in plain Node.
  ssr: { noExternal: true },
  build: {
    target: 'es2022',
    cssMinify: true,
    reportCompressedSize: true,
  },
})
