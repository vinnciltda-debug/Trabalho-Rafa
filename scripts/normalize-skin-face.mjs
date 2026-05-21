import fs from "fs"
import path from "path"

const publicDir = new URL("../public", import.meta.url).pathname

function renameSorted(dir, prefix) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "pt"))

  const temp = []
  for (const file of files) {
    const num = String(temp.length + 1).padStart(2, "0")
    const dest = `${prefix}-${num}.png`
    const from = path.join(dir, file)
    const to = path.join(dir, dest)
    if (file !== dest) {
      const tmp = path.join(dir, `__tmp-${num}.png`)
      fs.renameSync(from, tmp)
      temp.push({ tmp, to })
    }
  }
  for (const { tmp, to } of temp) {
    fs.renameSync(tmp, to)
  }
  return files.length
}

const skinDir = path.join(publicDir, "skin")
const faceDir = path.join(publicDir, "face")

const skinCount = renameSorted(skinDir, "skin")

const faceFiles = fs.readdirSync(faceDir).filter((f) => f.endsWith(".png") && !f.startsWith("."))
const faceSrc = path.join(faceDir, faceFiles[0])
const faceDest = path.join(faceDir, "base-face.png")
if (faceFiles[0] !== "base-face.png") {
  if (fs.existsSync(faceDest)) fs.unlinkSync(faceDest)
  fs.renameSync(faceSrc, faceDest)
  for (const extra of faceFiles.slice(1)) {
    if (extra !== "base-face.png") fs.unlinkSync(path.join(faceDir, extra))
  }
}

const manifestPath = path.join(publicDir, "avatar-manifest.json")
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
manifest.skin = skinCount
manifest.face = ["base-face"]
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log({ skinCount, face: "base-face.png" })
