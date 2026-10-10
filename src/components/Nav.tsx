import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { nav, person } from '../content/site'
import { useTheme } from '../hooks/useTheme'
import { useActiveSection } from '../lib/sectionStore'

export function Nav() {
  const { theme, toggle } = useTheme()
  const active = useActiveSection()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled
          ? 'border-b border-line bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 xs:gap-4">
        <a href="#top" className="whitespace-nowrap font-display text-[0.95rem] max-[350px]:text-[0.82rem] font-medium tracking-[-0.02em] text-fg">
          {person.name}
        </a>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <nav aria-label="Primary">
            <ul className="flex items-center">
              {nav.map((l) => {
                const isActive = active === l.href.slice(1)
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative rounded-full px-1.5 py-1.5 text-[0.78rem] transition-colors max-[350px]:px-1 max-[350px]:text-[0.72rem] xs:px-2.5 xs:text-[0.8125rem] sm:px-3 sm:text-sm ${
                        isActive ? 'text-fg' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-1.5 -bottom-px xs:inset-x-3 h-px origin-left bg-gradient-to-r from-accent-a to-accent-b transition-transform duration-300 ${
                          isActive ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <button
            type="button"
            onClick={toggle}
            className="ex-btn ml-1"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
