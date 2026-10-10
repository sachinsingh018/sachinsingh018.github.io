// Fails the build if an em dash (U+2014) or an emoji appears in the given folder.
// Usage: node scripts/check-copy.mjs src   |   node scripts/check-copy.mjs dist
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const target = process.argv[2] ?? 'src'
const TEXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.html', '.json', '.md', '.svg', '.txt', '.xml'])
const EM_DASH = '—'
// Pictographic emoji, excluding plain symbols like © and the multiplication sign.
const EMOJI = /\p{Extended_Pictographic}/u
const ALLOWED = new Set(['©', '®', '™'])

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (TEXT.has(extname(p))) yield p
  }
}

const problems = []
for (const file of walk(target)) {
  // Third-party vendor chunks may contain these characters in their own strings; we only police our copy.
  if (target === 'dist' && /assets[\\/].*\.js$/.test(file) && !/index-/.test(file)) continue
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (line.includes(EM_DASH)) problems.push(`${file}:${i + 1}: em dash`)
    for (const ch of line) {
      if (EMOJI.test(ch) && !ALLOWED.has(ch)) {
        problems.push(`${file}:${i + 1}: emoji ${JSON.stringify(ch)}`)
        break
      }
    }
  })
}

if (problems.length) {
  console.error(`check-copy: ${problems.length} problem(s) in ${target}/`)
  problems.slice(0, 50).forEach((p) => console.error('  ' + p))
  process.exit(1)
}
console.log(`check-copy: ${target}/ is clean (no em dashes, no emoji)`)
