import fs from "fs"
import path from "path"

const publicDir = new URL("../public", import.meta.url).pathname
const src = publicDir

const HAIR_COLOR_MAP = {
  "preto:": "preto",
  "castanho:": "castanho",
  "branco:": "branco",
  "cinza:": "cinza",
  "loiro:": "loiro",
  "loiro claro:": "loiro-claro",
  "loiro ruivo:": "loiro-ruivo",
  "marrom escuro:": "marrom-escuro",
  "marrom avermelhado:": "marrom-avermelhado",
  "ruivo laranja:": "ruivo-laranja",
  "ruivo vermelho:": "ruivo-vermelho",
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copySorted(srcDir, destDir, prefix) {
  ensureDir(destDir)
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".png") && !f.includes(" 2.png") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "pt"))

  files.forEach((file, i) => {
    const num = String(i + 1).padStart(2, "0")
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, `${prefix}-${num}.png`))
  })
  return files.length
}

const targets = ["skin", "face", "mouth", "eyes", "hair", "clothes", "accessories", "brush"]
for (const t of targets) {
  const dir = path.join(publicDir, t)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
  ensureDir(dir)
}

const skinSource = fs.existsSync(path.join(src, "Pele"))
  ? path.join(src, "Pele")
  : path.join(publicDir, "skin")
const skinCount = copySorted(skinSource, path.join(publicDir, "skin"), "skin")
const mouthCount = copySorted(path.join(src, "Boca"), path.join(publicDir, "mouth"), "mouth")
const eyesCount = copySorted(path.join(src, "Brilho"), path.join(publicDir, "eyes"), "eyes")

ensureDir(path.join(publicDir, "face"))
const faceFile = fs.readdirSync(path.join(src, "Rosto")).find((f) => f.endsWith(".png"))
fs.copyFileSync(path.join(src, "Rosto", faceFile), path.join(publicDir, "face", "base-face.png"))

const hairRoot = path.join(src, "Cabelo")
const hairColors = {}
for (const folder of fs.readdirSync(hairRoot)) {
  const slug = HAIR_COLOR_MAP[folder]
  if (!slug) continue
  const srcHairDir = path.join(hairRoot, folder)
  if (!fs.statSync(srcHairDir).isDirectory()) continue
  const destHairDir = path.join(publicDir, "hair", slug)
  const count = copySorted(srcHairDir, destHairDir, "style")
  hairColors[slug] = count
}

const manifest = {
  skin: skinCount,
  face: ["base-face"],
  mouth: mouthCount,
  eyes: eyesCount,
  hair: hairColors,
  clothes: 0,
  accessories: 0,
  brush: 0,
}

fs.writeFileSync(path.join(publicDir, "avatar-manifest.json"), JSON.stringify(manifest, null, 2))
console.log("Organized assets:", manifest)
