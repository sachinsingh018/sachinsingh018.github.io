# sachinsingh018.github.io

My portfolio. A single page with three animated "how it works" explainers, a 3D system graph in the hero, and deep-linkable case studies (`#work/renewal-agent`, `#work/latency`, `#work/rag-cache`).

Built with Vite, React 19, TypeScript, Tailwind CSS v4, React Three Fiber, GSAP and Motion. Prerendered at build time, deployed to GitHub Pages by GitHub Actions.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, copy check, build, prerender into dist/
npm run preview    # serve dist/ at http://localhost:4173
```

`npm run build` fails if an em dash or an emoji appears in `src/` or `dist/`.

## Update content

All copy lives in `src/content/`. Components only lay it out.

- `src/content/site.ts`: hero, impact metrics, logo row, case studies, process, experience, toolkit, projects, contact, footer.
- `src/content/explainers.ts`: the step labels and captions for each explainer.

Rules for editing:

1. Every number, title and date must trace to the resume. Check before you publish.
2. Keep it short. The page targets 600 to 800 visible words, not counting explainer captions.
3. No em dashes. Use commas, colons or separate sentences.

### Add an achievement

- A new headline number: add an entry to `impact` in `site.ts` (keep it to four).
- A new engagement: add it under the right employer and role in `experience.employers`. One sentence, one metric.
- A "what I got wrong first" line for a case study: set `gotWrongFirst` on that case. It shows in the case study sheet.

## Add a logo

1. Find the source SVG. Prefer `node_modules/simple-icons/icons/<slug>.svg`; otherwise drop an SVG in `scripts/vendor/`.
2. Add it to `SOURCES` in `scripts/build-logos.mjs`.
3. Run `npm run logos`. It writes a single-colour, SVGO-optimised file to `public/logos/`.
4. Reference it by name, for example `{ name: 'Docker', logo: 'docker' }` in `toolkit.tools`.

Logos render as CSS masks tinted with the current text colour, so they follow the theme. Client organisations in the "Shipped for" row are typographic wordmarks on purpose: several restrict use of their marks (the Massachusetts seal cannot be used for advertising under M.G.L. c.264 s.5).

## Add an explainer

1. Add step data to `src/content/explainers.ts`: an `id`, a one-sentence `summary` for screen readers, and `steps` with `id`, `label` and `caption`.
2. Create `src/explainers/MyExplainer.tsx`. Render the diagram as SVG and pass a `build(root, layout)` function to `ExplainerShell` that returns a GSAP timeline with one label per step id, in order. Design two layouts: `wide` and `tall` (phones).
3. Register it in `src/explainers/registry.tsx` and add a case study to `work.cases` in `site.ts`.

`ExplainerShell` handles autoplay at 40% in view, play and pause, replay, the step scrubber, speed, the caption track, keyboard control (Space, arrows, Home, End) and reduced motion (final state plus a numbered step list).

## Deploy

Pushes to `main` build and deploy through `.github/workflows/deploy.yml`. One-time setup: in the repository settings, set Pages > Source to "GitHub Actions".

## Performance notes

- The headline is prerendered and is the LCP element. Fonts are self-hosted with metric-matched fallbacks.
- three.js loads as a separate chunk after the page is idle. A still render (`public/hero-poster.webp`) shows first.
- The canvas renders on demand: continuously while the hero is on screen, then only while something is changing. DPR is clamped to 1 to 1.75; low-tier GPUs get fewer nodes and no bloom; phones get fewer nodes and no parallax.
- `prefers-reduced-motion` turns off smooth scroll, parallax, reveals and autoplay; explainers show their final state and step list.

## Project layout

```
src/
  content/     site.ts, explainers.ts       all copy and data
  components/  page sections and small UI pieces
  explainers/  ExplainerShell and the three explainers
  three/       hero scene, graph data, GPU tier detection
  hooks/, lib/ small shared helpers
public/        logos, favicon, social image, poster, robots.txt, sitemap.xml
scripts/       logo pipeline, copy check, prerender
```
