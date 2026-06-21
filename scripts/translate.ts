#!/usr/bin/env npx ts-node
/**
 * translate.ts — пре-билд автоперевод статей
 *
 * Запуск:
 *   npx ts-node scripts/translate.ts
 *   npx ts-node scripts/translate.ts --dry-run
 *   npx ts-node scripts/translate.ts --force
 */

import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import * as https from "https"
import { fileURLToPath } from "url"

// ─── Конфиг ───────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_ROOT = path.resolve(__dirname, "../content")
const RU_DIR = path.join(CONTENT_ROOT, "ru")
const EN_DIR = path.join(CONTENT_ROOT, "en")
const CACHE_FILE = path.resolve(__dirname, "../.translation-cache.json")

const DRY_RUN = process.argv.includes("--dry-run")
const FORCE = process.argv.includes("--force")

// Задержка между запросами (мс)
const DELAY_MS = 1200

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  sourceHash: string
  translatedAt: string
}

type Cache = Record<string, CacheEntry>

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex")
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function loadCache(): Cache {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
    } catch {
      console.warn("⚠️  Кэш повреждён, создаём новый")
    }
  }
  return {}
}

function saveCache(cache: Cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8")
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// ─── Парсинг Frontmatter ───────────────────────────────────────────────────────

interface ParsedFile {
  frontmatter: Record<string, string>
  fmRaw: string
  body: string
}

function parseFrontmatter(content: string): ParsedFile {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, fmRaw: "", body: content }
  }
  const end = content.indexOf("---", 3)
  if (end === -1) return { frontmatter: {}, fmRaw: "", body: content }

  const fmRaw = content.slice(3, end).trim()
  const body = content.slice(end + 3).trim()
  const frontmatter: Record<string, string> = {}

  for (const line of fmRaw.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (m) frontmatter[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "")
  }

  return { frontmatter, fmRaw, body }
}

function buildFrontmatter(fm: Record<string, string>): string {
  const lines = Object.entries(fm).map(([k, v]) => {
    const needsQuotes = /[:#\[\]{},|>&*!]/.test(v) || v.includes("\n")
    return `${k}: ${needsQuotes ? `'${v.replace(/'/g, "''")}'` : v}`
  })
  return `---\n${lines.join("\n")}\n---\n\n`
}

// ─── Google Translate (unofficial, POST) ──────────────────────────────────────
// POST вместо GET — кириллица в encodeURIComponent раздувает GET-URL втрое → 400.

function gtranslateSingle(text: string, from: string, to: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ q: text }).toString()
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t`

    const options: https.RequestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "Mozilla/5.0",
      },
    }

    const req = https.request(url, options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        if (res.statusCode === 429) {
          reject(new Error("GT rate limit (429)"))
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`GT HTTP ${res.statusCode}: ${data.slice(0, 150)}`))
          return
        }
        try {
          const json = JSON.parse(data)
          const translated = (json[0] as [string][])
            .map((part) => part[0])
            .filter(Boolean)
            .join("")
          resolve(translated)
        } catch {
          reject(new Error(`GT parse error: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on("error", reject)
    req.write(body)
    req.end()
  })
}

// Retry с экспоненциальной задержкой
async function gtranslateWithRetry(
  text: string,
  from: string,
  to: string,
  retries = 3,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await gtranslateSingle(text, from, to)
    } catch (err: any) {
      if (attempt === retries) throw err
      const wait = DELAY_MS * attempt * 2
      console.warn(`  ⚠️  Попытка ${attempt} (${err.message}), повтор через ${wait}мс...`)
      await sleep(wait)
    }
  }
  throw new Error("unreachable")
}

// Разбиваем на чанки по ~1500 символов
// (кириллица = ~3 байта/символ, безопасный размер POST-тела ~5KB)
async function translateText(text: string, from: string, to: string): Promise<string> {
  const CHUNK_SIZE = 1500

  if (text.length <= CHUNK_SIZE) {
    return gtranslateWithRetry(text, from, to)
  }

  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let current = ""

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > CHUNK_SIZE && current) {
      chunks.push(current)
      current = para
    } else {
      current = current ? current + "\n\n" + para : para
    }
  }
  if (current) chunks.push(current)

  const results: string[] = []
  for (const chunk of chunks) {
    const translated = await gtranslateWithRetry(chunk, from, to)
    results.push(translated)
    if (chunks.length > 1) await sleep(DELAY_MS)
  }

  return results.join("\n\n")
}

// ─── Перевод одного файла ─────────────────────────────────────────────────────

async function translateFile(
  ruPath: string,
  enPath: string,
  relPath: string,
  cache: Cache,
): Promise<boolean> {
  const content = fs.readFileSync(ruPath, "utf-8")
  const hash = sha256(content)

  if (!FORCE && cache[relPath]?.sourceHash === hash && fs.existsSync(enPath)) {
    return false
  }

  const { frontmatter, body } = parseFrontmatter(content)

  if (frontmatter.translation) {
    return false
  }

  console.log(`  🤖 Перевожу: ${relPath}`)

  if (DRY_RUN) return true

  try {
    const enFm = { ...frontmatter }
    enFm.lang = "en"
    enFm.autoTranslated = "true"
    delete enFm.translation

    if (frontmatter.title) {
      enFm.title = await gtranslateWithRetry(frontmatter.title, "ru", "en")
      await sleep(DELAY_MS)
    }
    if (frontmatter.description) {
      enFm.description = await gtranslateWithRetry(frontmatter.description, "ru", "en")
      await sleep(DELAY_MS)
    }

    // Защищаем блоки кода от перевода
    const codeBlocks: string[] = []
    const bodyWithPlaceholders = body.replace(/```[\s\S]*?```/g, (match) => {
      const idx = codeBlocks.push(match) - 1
      return `__CODE_BLOCK_${idx}__`
    })

    const translatedBody = await translateText(bodyWithPlaceholders, "ru", "en")

    const finalBody = translatedBody.replace(
      /__CODE_BLOCK_(\d+)__/g,
      (_, idx) => codeBlocks[Number(idx)],
    )

    const output = buildFrontmatter(enFm) + finalBody

    ensureDir(enPath)
    fs.writeFileSync(enPath, output, "utf-8")

    cache[relPath] = {
      sourceHash: hash,
      translatedAt: new Date().toISOString(),
    }

    return true
  } catch (err) {
    console.error(`  ❌ Ошибка перевода ${relPath}:`, err)
    return false
  }
}

// ─── Обход файлов ─────────────────────────────────────────────────────────────

function walkDir(dir: string, base: string = dir): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      results.push(...walkDir(full, base))
    } else if (name.endsWith(".md")) {
      results.push(path.relative(base, full))
    }
  }
  return results
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(RU_DIR)) {
    console.error(`❌ Папка content/ru/ не найдена: ${RU_DIR}`)
    process.exit(1)
  }

  const cache = loadCache()
  const ruFiles = walkDir(RU_DIR)

  console.log(`📂 Найдено .md файлов в content/ru/: ${ruFiles.length}`)
  if (DRY_RUN) console.log("=== DRY RUN ===\n")

  let translated = 0
  let skipped = 0
  let hasManual = 0

  for (const relPath of ruFiles) {
    const ruPath = path.join(RU_DIR, relPath)
    const enPath = path.join(EN_DIR, relPath)

    if (fs.existsSync(enPath)) {
      const enContent = fs.readFileSync(enPath, "utf-8")
      const { frontmatter } = parseFrontmatter(enContent)
      if (frontmatter.autoTranslated !== "true") {
        hasManual++
        continue
      }
    }

    const didTranslate = await translateFile(ruPath, enPath, relPath, cache)

    if (didTranslate) {
      translated++
      if (!DRY_RUN) await sleep(DELAY_MS)
    } else {
      skipped++
    }
  }

  if (!DRY_RUN) saveCache(cache)

  console.log(`\n✅ Готово:`)
  console.log(`   Переведено:        ${translated}`)
  console.log(`   Не изменились:     ${skipped}`)
  console.log(`   Ручной перевод:    ${hasManual}`)
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
