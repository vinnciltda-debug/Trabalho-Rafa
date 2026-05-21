"use client"

import { forwardRef, useMemo, type CSSProperties } from "react"
import type { AvatarConfig } from "./avatar-config"
import {
  type AvatarManifest,
  type LayerId,
  LAYER_Z_INDEX,
  accessoriesPath,
  avatarManifest,
  brushPath,
  clothesPath,
  eyesPath,
  facePath,
  hairPath,
  mouthPath,
  skinPath,
} from "./avatar-assets"
import { cn } from "@/lib/utils"

interface AvatarLayersProps {
  config: AvatarConfig
  className?: string
  manifest?: AvatarManifest
}

export interface AvatarLayerSource {
  id: LayerId
  src: string
  zIndex: number
}

export function getLayerSources(
  config: AvatarConfig,
  manifest: AvatarManifest = avatarManifest,
): AvatarLayerSource[] {
  const layers: AvatarLayerSource[] = [
    { id: "skin", src: skinPath(config.skinIndex), zIndex: LAYER_Z_INDEX.skin },
    { id: "face", src: facePath(), zIndex: LAYER_Z_INDEX.face },
    { id: "eyes", src: eyesPath(config.eyesIndex), zIndex: LAYER_Z_INDEX.eyes },
    { id: "mouth", src: mouthPath(config.mouthIndex), zIndex: LAYER_Z_INDEX.mouth },
    {
      id: "hair",
      src: hairPath(config.hairColor, config.hairStyleIndex, manifest),
      zIndex: LAYER_Z_INDEX.hair,
    },
  ]

  if (config.accessoriesIndex > 0) {
    layers.push({
      id: "accessories",
      src: accessoriesPath(config.accessoriesIndex, manifest),
      zIndex: LAYER_Z_INDEX.accessories,
    })
  }

  if (config.clothesIndex > 0) {
    layers.push({
      id: "clothes",
      src: clothesPath(config.clothesIndex),
      zIndex: LAYER_Z_INDEX.clothes,
    })
  }

  if (config.brushIndex > 0) {
    layers.push({
      id: "brush",
      src: brushPath(config.brushIndex),
      zIndex: LAYER_Z_INDEX.brush,
    })
  }

  return layers.sort((a, b) => a.zIndex - b.zIndex)
}

const layerImgStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  objectPosition: "center",
  background: "transparent",
  pointerEvents: "none",
}

/** Canvas interno das layers — sempre 640×640 */
const layerCanvasStyle: CSSProperties = {
  position: "relative",
  width: 640,
  height: 640,
  overflow: "hidden",
  transform: "translate(-50%, -50%) scale(calc(min(90vw, 420px) / 640px))",
  transformOrigin: "center center",
}

export const AvatarLayers = forwardRef<HTMLDivElement, AvatarLayersProps>(function AvatarLayers(
  { config, className, manifest = avatarManifest },
  ref,
) {
  const layers = useMemo(() => getLayerSources(config, manifest), [config, manifest])

  return (
    <div
      ref={ref}
      className={cn(
        "relative mx-auto aspect-square w-[min(90vw,420px)] overflow-hidden rounded-[32px] bg-transparent",
        className,
      )}
      role="img"
      aria-label="Pré-visualização do avatar"
    >
      <div className="absolute left-1/2 top-1/2" style={layerCanvasStyle}>
        {layers.map((layer) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${layer.id}-${layer.src}`}
            src={layer.src}
            alt={layer.id}
            draggable={false}
            style={{
              ...layerImgStyle,
              zIndex: layer.zIndex,
            }}
          />
        ))}
      </div>
    </div>
  )
})
