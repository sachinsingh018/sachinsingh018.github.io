import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './styles/index.css'
import './styles/explainers.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build prerenders the page into #root; hydrate it when present.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
