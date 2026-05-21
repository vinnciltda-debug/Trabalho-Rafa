import manifest from "@/public/avatar-manifest.json"

export type HairColorId = keyof typeof manifest.hair

export interface AvatarManifest {
  skin: number
  face: string[]
  mouth: number
  eyes: number
  hair: Record<string, number>
  clothes: number
  accessories: number
  brush: number
  files?: {
    skin: string[]
    face: string[]
    mouth: string[]
    hair?: Record<string, string[]>
    accessories?: string[]
  }
}

export const avatarManifest = manifest as AvatarManifest

export const SKIN_COUNT = avatarManifest.skin
export const MOUTH_COUNT = avatarManifest.mouth
export const EYES_COUNT = avatarManifest.eyes
export const CLOTHES_COUNT = avatarManifest.clothes
export const ACCESSORIES_COUNT = avatarManifest.accessories
export const BRUSH_COUNT = avatarManifest.brush

export const HAIR_COLORS = Object.keys(avatarManifest.hair).sort((a, b) =>
  a.localeCompare(b, "pt"),
) as HairColorId[]

const HAIR_LABELS: Record<string, string> = {
  preto: "Preto",
  castanho: "Castanho",
  cinza: "Cinza",
  loiro: "Loiro",
  "loiro-claro": "Loiro claro",
  "loiro-ruivo": "Loiro ruivo",
  "marrom-escuro": "Marrom escuro",
  "marrom-avermelhado": "Marrom avermelhado",
  "ruivo-laranja": "Ruivo laranja",
  "ruivo-vermelho": "Ruivo vermelho",
}

const HAIR_SWATCHES: Record<string, string> = {
  preto: "#1c1917",
  castanho: "#5c4033",
  cinza: "#a8a29e",
  loiro: "#d6b98c",
  "loiro-claro": "#f0ddb8",
  "loiro-ruivo": "#c97b63",
  "marrom-escuro": "#3f2e22",
  "marrom-avermelhado": "#7a3e2e",
  "ruivo-laranja": "#e07a3a",
  "ruivo-vermelho": "#b83232",
}

/** Ordem de empilhamento (de baixo para cima) */
export const LAYER_ORDER = [
  "skin",
  "face",
  "eyes",
  "mouth",
  "hair",
  "accessories",
  "clothes",
  "brush",
] as const

export type LayerId = (typeof LAYER_ORDER)[number]

export const LAYER_Z_INDEX: Record<LayerId, number> = {
  skin: 10,
  face: 20,
  eyes: 30,
  mouth: 40,
  hair: 50,
  accessories: 60,
  clothes: 70,
  brush: 80,
}

export function getHairColorLabel(colorId: string) {
  return HAIR_LABELS[colorId] ?? colorId
}

export function getHairColorSwatch(colorId: string) {
  return HAIR_SWATCHES[colorId] ?? "#a8a29e"
}

export function skinPath(index: number) {
  return `/skin/skin-${pad(index)}.png`
}

export function facePath() {
  return "/face/base-face.png"
}

export function mouthPath(index: number) {
  return `/mouth/mouth-${pad(index)}.png`
}

export function eyesPath(index: number) {
  return `/eyes/eyes-${pad(index)}.png`
}

export function hairPath(
  color: HairColorId,
  styleIndex: number,
  manifest: AvatarManifest = avatarManifest,
) {
  const files = manifest.files?.hair?.[color]
  const file = files?.[styleIndex - 1]
  if (file) return file
  return `/hair/${color}/style-${pad(styleIndex)}.png`
}

export function clothesPath(index: number) {
  return `/clothes/clothes-${pad(index)}.png`
}

function toAssetUrl(path: string) {
  const slash = path.lastIndexOf("/")
  if (slash < 0) return path
  return `${path.slice(0, slash + 1)}${encodeURIComponent(path.slice(slash + 1))}`
}

export function accessoriesPath(
  index: number,
  manifest: AvatarManifest = avatarManifest,
): string {
  if (index <= 0) return ""
  const files = manifest.files?.accessories
  const file = files?.[index - 1]
  if (file) return toAssetUrl(file)
  return `/accessories/accessories-${pad(index)}.png`
}

export function accessoriesCount(manifest: AvatarManifest = avatarManifest) {
  return manifest.files?.accessories?.length ?? manifest.accessories ?? 0
}

export function brushPath(index: number) {
  return `/brush/brush-${pad(index)}.png`
}

export function hairStyleCount(color: HairColorId, manifest: AvatarManifest = avatarManifest) {
  return manifest.hair[color] ?? 0
}

function pad(index: number) {
  return String(index).padStart(2, "0")
}
