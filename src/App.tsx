import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { sectionIds } from './content/site'
import { setActiveSection } from './lib/sectionStore'
import { useCaseRoute } from './hooks/useHashRoute'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { ImpactStrip } from './components/ImpactStrip'
import { LogoWall } from './components/LogoWall'
import { Work } from './components/Work'
import { HowIWork } from './components/HowIWork'
import { Experience } from './components/Experience'
import { SkillsBand } from './components/SkillsBand'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { CaseSheet } from './components/CaseSheet'
import { SmoothScroll } from './components/SmoothScroll'

/** Tracks which section crosses the middle of the viewport, for the nav and the hero graph. */
function useSectionTracking() {
  useEffect(() => {
    const visible = new Map<string, boolean>()
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting))
        const current = sectionIds.find((id) => visible.get(id))
        setActiveSection(current ?? 'hero')
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  const { openCase, open, close } = useCaseRoute()
  useSectionTracking()

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-3 z-[90] rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg"
      >
        Skip to content
      </a>
      <div data-page-root>
        <Nav />
      </div>
      <main id="main" data-page-root tabIndex={-1} className="outline-none">
        <Hero />
        <ImpactStrip />
        <LogoWall />
        <Work onOpen={open} openId={openCase} />
        <HowIWork />
        <Experience />
        <SkillsBand />
        <Projects />
        <Contact />
      </main>
      <div data-page-root>
        <Footer />
      </div>
      <CaseSheet openId={openCase} onClose={close} onOpen={open} />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  )
}
