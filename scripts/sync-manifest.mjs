import fs from "fs"
import path from "path"

const publicDir = new URL("../public", import.meta.url).pathname

/** Pastas de cabelo obsoletas — ignoradas no scan */
const HAIR_EXCLUDE = new Set(["branco"])

function listPng(dir, pattern) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith(".") && pattern.test(f))
    .sort((a, b) => a.localeCompare(b, "pt"))
}

function renameSorted(dir, prefix) {
  const all = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "pt"))

  const needsRename = all.some((f) => !f.startsWith(`${prefix}-`))
  if (!needsRename) return all.length

  const temp = []
  for (const file of all) {
    const num = String(temp.length + 1).padStart(2, "0")
    const dest = `${prefix}-${num}.png`
    if (file === dest) continue
    const from = path.join(dir, file)
    const tmp = path.join(dir, `__tmp-${num}.png`)
    fs.renameSync(from, tmp)
    temp.push({ tmp, to: path.join(dir, dest) })
  }
  for (const { tmp, to } of temp) {
    fs.renameSync(tmp, to)
  }
  return all.length
}

function scanHair() {
  const hairRoot = path.join(publicDir, "hair")
  const hair = {}
  const hairFiles = {}

  if (!fs.existsSync(hairRoot)) {
    return { hair, hairFiles }
  }

  for (const folder of fs.readdirSync(hairRoot).sort((a, b) => a.localeCompare(b, "pt"))) {
    if (HAIR_EXCLUDE.has(folder)) continue

    const dir = path.join(hairRoot, folder)
    if (!fs.statSync(dir).isDirectory()) continue

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".png") && !f.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "pt"))

    if (files.length === 0) continue

    hair[folder] = files.length
    hairFiles[folder] = files.map((f) => `/hair/${folder}/${f}`)
  }

  return { hair, hairFiles }
}

// Mouth: rename only if still using old names (does not modify PNG bytes)
const mouthDir = path.join(publicDir, "mouth")
renameSorted(mouthDir, "mouth")

const skinFiles = listPng(path.join(publicDir, "skin"), /^skin-\d{2}\.png$/)
const faceFiles = listPng(path.join(publicDir, "face"), /^base-face\.png$/)
const mouthFiles = listPng(path.join(publicDir, "mouth"), /^mouth-\d{2}\.png$/)
const { hair, hairFiles } = scanHair()

function scanAccessories() {
  const dir = path.join(publicDir, "accessories")
  if (!fs.existsSync(dir)) return { count: 0, files: [] }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "pt"))
    .map((f) => `/accessories/${f}`)

  return { count: files.length, files }
}

const { count: accessoriesCount, files: accessoryFiles } = scanAccessories()

const existing = fs.existsSync(path.join(publicDir, "avatar-manifest.json"))
  ? JSON.parse(fs.readFileSync(path.join(publicDir, "avatar-manifest.json"), "utf8"))
  : {}

const manifest = {
  ...existing,
  skin: skinFiles.length,
  face: faceFiles.map((f) => f.replace(".png", "")),
  mouth: mouthFiles.length,
  eyes: existing.eyes ?? 4,
  hair,
  clothes: existing.clothes ?? 0,
  accessories: accessoriesCount,
  brush: existing.brush ?? 0,
  files: {
    skin: skinFiles.map((f) => `/skin/${f}`),
    face: faceFiles.map((f) => `/face/${f}`),
    mouth: mouthFiles.map((f) => `/mouth/${f}`),
    hair: hairFiles,
    accessories: accessoryFiles,
  },
}

fs.writeFileSync(path.join(publicDir, "avatar-manifest.json"), JSON.stringify(manifest, null, 2))
console.log("Hair colors:", Object.keys(hair).join(", "))
console.log("Accessories:", accessoriesCount, accessoryFiles)
