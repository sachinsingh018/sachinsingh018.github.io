import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Preloads the latin subsets of the display and body fonts so the headline paints in its real face sooner. */
function preloadFonts(): Plugin {
  const wanted = [/geist-latin-wght-normal-.*\.woff2$/, /inter-latin-wght-normal-.*\.woff2$/]
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      if (!ctx.bundle) return
      return Object.keys(ctx.bundle)
        .filter((f) => wanted.some((re) => re.test(f)))
        .map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' },
          injectTo: 'head' as const,
        }))
    },
  }
}

// User site on GitHub Pages, served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), preloadFonts()],
  // The prerender build bundles every dependency so it runs in plain Node.
  ssr: { noExternal: true },
  build: {
    target: 'es2022',
    cssMinify: true,
    reportCompressedSize: true,
    // three.js is a lazy chunk by design; it is reported separately in the README budget.
    chunkSizeWarningLimit: 1100,
  },
})
