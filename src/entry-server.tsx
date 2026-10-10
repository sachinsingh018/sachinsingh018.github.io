import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

/** Used at build time only: renders the page to HTML so the headline paints before JavaScript runs. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
