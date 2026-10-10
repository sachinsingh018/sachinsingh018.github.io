// Copies the logos the site uses into public/logos as single-colour, SVGO-optimised SVGs,
// and copies the detect-gpu benchmark data into public/detect-gpu so nothing loads from a CDN.
//
// Sources:
// - Simple Icons (CC0 project licence; marks remain their owners' trademarks): node_modules/simple-icons
// - Devicon (MIT) for marks Simple Icons no longer carries (Java, SQL Server, AWS): scripts/vendor/devicon
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { optimize } from 'svgo'

const OUT = 'public/logos'
mkdirSync(OUT, { recursive: true })

const SOURCES = {
  appian: 'node_modules/simple-icons/icons/appian.svg',
  python: 'node_modules/simple-icons/icons/python.svg',
  react: 'node_modules/simple-icons/icons/react.svg',
  claude: 'node_modules/simple-icons/icons/claude.svg',
  docker: 'node_modules/simple-icons/icons/docker.svg',
  git: 'node_modules/simple-icons/icons/git.svg',
  langchain: 'node_modules/simple-icons/icons/langchain.svg',
  github: 'node_modules/simple-icons/icons/github.svg',
  java: 'scripts/vendor/devicon/java-plain.svg',
  sqlserver: 'scripts/vendor/devicon/microsoftsqlserver-plain.svg',
  aws: 'scripts/vendor/devicon/amazonwebservices-plain-wordmark.svg',
}

for (const [name, src] of Object.entries(SOURCES)) {
  if (!existsSync(src)) {
    console.error(`missing logo source: ${src}`)
    process.exit(1)
  }
  const raw = readFileSync(src, 'utf8')
  const { data } = optimize(raw, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeDimensions',
      // Single colour: the site renders these as CSS masks tinted with currentColor.
      { name: 'removeAttrs', params: { attrs: ['fill', 'class', 'style'] } },
    ],
  })
  writeFileSync(join(OUT, `${name}.svg`), data.replace('<svg', '<svg fill="#000"'))
  console.log(`logos: ${name}.svg (${data.length} bytes)`)
}

cpSync('node_modules/@pmndrs/detect-gpu/dist/benchmarks', 'public/detect-gpu', { recursive: true })
console.log('detect-gpu benchmarks copied to public/detect-gpu')
