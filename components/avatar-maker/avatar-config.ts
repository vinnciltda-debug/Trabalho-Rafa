import {
  type AvatarManifest,
  type HairColorId,
  avatarManifest,
  SKIN_COUNT,
  MOUTH_COUNT,
  EYES_COUNT,
  CLOTHES_COUNT,
  accessoriesCount,
  BRUSH_COUNT,
  hairStyleCount,
} from "./avatar-assets"

export interface AvatarConfig {
  skinIndex: number
  mouthIndex: number
  eyesIndex: number
  hairColor: HairColorId
  hairStyleIndex: number
  clothesIndex: number
  accessoriesIndex: number
  brushIndex: number
}

export const defaultAvatarConfig: AvatarConfig = {
  skinIndex: 1,
  mouthIndex: 1,
  eyesIndex: 1,
  hairColor: "castanho",
  hairStyleIndex: 1,
  clothesIndex: 0,
  accessoriesIndex: 0,
  brushIndex: 0,
}

export function clampSkin(index: number) {
  return clamp(index, 1, SKIN_COUNT)
}

export function clampMouth(index: number) {
  return clamp(index, 1, MOUTH_COUNT)
}

export function clampEyes(index: number) {
  return clamp(index, 1, EYES_COUNT)
}

export function clampHairStyle(
  index: number,
  color: HairColorId,
  manifest: AvatarManifest = avatarManifest,
) {
  return clamp(index, 1, hairStyleCount(color, manifest))
}

export function clampClothes(index: number) {
  return CLOTHES_COUNT === 0 ? 0 : clamp(index, 1, CLOTHES_COUNT)
}

export function clampAccessories(
  index: number,
  manifest: AvatarManifest = avatarManifest,
) {
  const count = accessoriesCount(manifest)
  if (count === 0) return 0
  return clamp(index, 0, count)
}

export function randomAccessoriesIndex(manifest: AvatarManifest = avatarManifest) {
  const count = accessoriesCount(manifest)
  if (count === 0) return 0
  return randomInt(0, count)
}

export function clampBrush(index: number) {
  return BRUSH_COUNT === 0 ? 0 : clamp(index, 1, BRUSH_COUNT)
}

export function randomAvatarConfig(manifest: AvatarManifest = avatarManifest): AvatarConfig {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const hairColors = Object.keys(manifest.hair) as HairColorId[]
  const hairColor = pick(hairColors)
  return {
    skinIndex: randomInt(1, SKIN_COUNT),
    mouthIndex: randomInt(1, MOUTH_COUNT),
    eyesIndex: randomInt(1, EYES_COUNT),
    hairColor,
    hairStyleIndex: randomInt(1, hairStyleCount(hairColor, manifest)),
    clothesIndex: CLOTHES_COUNT ? randomInt(1, CLOTHES_COUNT) : 0,
    accessoriesIndex: randomAccessoriesIndex(manifest),
    brushIndex: BRUSH_COUNT ? randomInt(1, BRUSH_COUNT) : 0,
  }
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return 0
  return Math.min(Math.max(value, min), max)
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
