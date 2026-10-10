// Injects the server-rendered app into dist/index.html, then writes 404.html
// so unknown paths on GitHub Pages still load the site.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('.ssr/entry-server.js')).href)
const template = readFileSync('dist/index.html', 'utf8')
if (!template.includes('<!--app-html-->')) throw new Error('dist/index.html is missing the <!--app-html--> marker')
const html = template.replace('<!--app-html-->', render())
writeFileSync('dist/index.html', html)
writeFileSync('dist/404.html', html)
rmSync('.ssr', { recursive: true, force: true })
console.log(`prerender: wrote dist/index.html (${(html.length / 1024).toFixed(1)} KB) and dist/404.html`)
