import { footer, person } from '../content/site'

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-line">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-subtle md:flex-row md:items-center md:justify-between">
        <p className="m-0">{footer.colophon}</p>
        <div className="flex items-center gap-5">
          <a href={person.linkedin} target="_blank" rel="noreferrer" className="link-underline hover:text-fg">
            LinkedIn
          </a>
          <a href={person.github} target="_blank" rel="noreferrer" className="link-underline hover:text-fg">
            GitHub
          </a>
          <span className="num text-xs">© {new Date().getFullYear()} {person.name}</span>
        </div>
      </div>
    </footer>
  )
}
