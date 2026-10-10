import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Copy } from 'lucide-react'
import { contact, person } from '../content/site'
import { logoStyle } from '../lib/logo'
import { MagneticButton } from './ui/Magnetic'
import { Portrait } from './ui/Portrait'
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
    <section id="contact" aria-labelledby="contact-h" className="relative z-[1] scroll-mt-16 cv-section py-20 md:py-32">
      <div className="container-page">
        <Reveal>
          <p className="kicker" aria-hidden="true">
            {contact.kicker}
          </p>
          <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
            <Portrait
              widths={[320, 480]}
              sizes="(min-width: 640px) 160px, 120px"
              size={160}
              loading="lazy"
              className="h-[120px] w-[120px] rounded-2xl sm:h-40 sm:w-40"
            />
            <div className="min-w-0">
              <h2 id="contact-h" className="display max-w-[17ch] text-balance text-[clamp(2.4rem,1.2rem+4.2vw,5rem)]">
                {contact.heading}
              </h2>
              <p className="mt-6 text-lg text-muted">
                {contact.sub}{' '}
                <a href={`mailto:${person.email}`} className="link-underline font-mono text-[0.95em] text-fg">
                  {person.email}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <MagneticButton type="button" onClick={copy} className="btn btn-primary col-span-2 sm:col-span-1">
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
