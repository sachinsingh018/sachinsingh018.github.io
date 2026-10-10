import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Copy } from 'lucide-react'
import { contact, person } from '../content/site'
import { logoStyle } from '../lib/logo'
import { MagneticButton } from './ui/Magnetic'
import { Reveal } from './ui/Reveal'
import { Toast } from './ui/Toast'

export function Contact() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be blocked; fall back to the mail client.
      window.location.href = `mailto:${person.email}`
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-h" className="relative z-[1] scroll-mt-16 py-28 md:py-44">
      <div className="container-page">
        <Reveal>
          <p className="kicker" aria-hidden="true">
            {contact.kicker}
          </p>
          <h2 id="contact-h" className="display mt-5 max-w-[17ch] text-balance text-[clamp(2.4rem,1.2rem+4.2vw,5rem)]">
            {contact.heading}
          </h2>
          <p className="mt-6 text-lg text-muted">
            {contact.sub}{' '}
            <a href={`mailto:${person.email}`} className="link-underline font-mono text-[0.95em] text-fg">
              {person.email}
            </a>
          </p>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 flex flex-wrap items-center gap-3">
          <MagneticButton type="button" onClick={copy} className="btn btn-primary">
            <Copy size={15} aria-hidden="true" />
            Copy email
          </MagneticButton>
          <a href={person.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
            LinkedIn
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href={person.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
            <span className="logo-mask" style={logoStyle('github', 15)} aria-hidden="true" />
            GitHub
          </a>
        </Reveal>
      </div>
      <Toast message={contact.copied} show={copied} />
    </section>
  )
}
