/// ==========================================================================
/// scripts/build-scss-index.js
/// ==========================================================================
import fg from 'fast-glob'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Configure any SCSS subfolders you want indexed.
 * For each section, we scan _*.scss and emit an _<name>.auto.scss at ROOT.
 */
const ROOT = 'resources/scss'
const SECTIONS = [
    { name: 'abstracts', glob: 'abstracts/_*.scss', asStar: true },
    { name: 'base',      glob: 'base/_*.scss',      asStar: true },
    { name: 'components',glob: 'components/_*.scss',asStar: true },
]

/** Files we never import */
const ALWAYS_IGNORE = new Set([
    `${ROOT}/_all.auto.scss`,
    `${ROOT}/_abstracts.auto.scss`,
    `${ROOT}/_base.auto.scss`,
    `${ROOT}/_components.auto.scss`,
])

/** Also skip conventional manual indexes if present */
const EXTRA_IGNORE_SUFFIXES = new Set([
    '/_index.scss',
])

async function buildSection({ name, glob, asStar }) {
    const pattern = `${ROOT}/${glob}`

    let files = await fg(pattern, { dot: false })

    files = files
        .filter(f => !ALWAYS_IGNORE.has(f))
        .filter(f => ![...EXTRA_IGNORE_SUFFIXES].some(sfx => f.endsWith(sfx)))
        .sort() // lexicographic order (prefix with 00-, 10- if you need strict order)

    const lines = files.map(f => {
        // resources/scss/components/_buttons.scss -> components/buttons
        const rel = f.replace(`${ROOT}/`, '')
        const dir = path.posix.dirname(rel)
        const base = path.posix.basename(rel, '.scss')
        const clean = base.startsWith('_') ? base.slice(1) : base
        return `@forward "../${dir}/${clean}"${asStar ? '' : ''};`
    })

    const outFile = `${ROOT}/.auto/_${name}.auto.scss`
    writeFileSync(outFile, lines.join('\n') + (lines.length ? '\n' : ''))
    console.log(`· ${name.padEnd(11)} -> ${files.length.toString().padStart(3)} imports -> ${outFile}`)
    return outFile
}

async function main() {
    for (const s of SECTIONS) {
        await buildSection(s)
    }

    // Optional: emit a single “everything” file you can @use once if you prefer.
    const allFile = `${ROOT}/.auto/_all.auto.scss`
    const allLines = SECTIONS.map(s => `@forward "./${s.name}.auto";`)
    writeFileSync(allFile, allLines.join('\n') + '\n')
    console.log(`· all          -> combines ${SECTIONS.length} sections -> ${allFile}`)
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
