"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { AvatarLayers, getLayerSources } from "./avatar-layers"
import {
  type HairColorId,
  getHairColorLabel,
  getHairColorSwatch,
  SKIN_COUNT,
  MOUTH_COUNT,
  EYES_COUNT,
  CLOTHES_COUNT,
  BRUSH_COUNT,
  accessoriesCount,
  accessoriesPath,
  hairPath,
  skinPath,
  mouthPath,
  eyesPath,
  hairStyleCount,
} from "./avatar-assets"
import { useAvatarManifest } from "./use-avatar-manifest"
import {
  type AvatarConfig,
  clampHairStyle,
  defaultAvatarConfig,
  randomAvatarConfig,
} from "./avatar-config"
import { cn } from "@/lib/utils"

function ThumbnailOption({
  src,
  selected,
  onClick,
  label,
}: {
  src: string
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl border bg-[#faf7f2] transition-all",
        selected
          ? "border-foreground ring-2 ring-foreground/10"
          : "border-transparent hover:border-foreground/20",
      )}
    >
      <Image src={src} alt="" fill className="object-contain p-1" sizes="80px" unoptimized />
    </button>
  )
}

function ColorOption({
  colorId,
  selected,
  onClick,
}: {
  colorId: HairColorId
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={getHairColorLabel(colorId)}
      aria-pressed={selected}
      title={getHairColorLabel(colorId)}
      className={cn(
        "size-9 rounded-full border-2 transition-transform hover:scale-105",
        selected ? "border-foreground scale-105" : "border-white/80",
      )}
      style={{ backgroundColor: getHairColorSwatch(colorId) }}
    />
  )
}

function NoneOption({
  selected,
  onClick,
}: {
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Nenhum"
      aria-pressed={selected}
      className={cn(
        "flex aspect-square items-center justify-center rounded-2xl border bg-[#faf7f2] text-xs font-medium text-muted-foreground transition-all",
        selected
          ? "border-foreground text-foreground ring-2 ring-foreground/10"
          : "border-transparent hover:border-foreground/20",
      )}
    >
      Nenhum
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    <section className="space-y-3">
      <label className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </label>
      {children}
    </section>
}

export function AvatarMaker() {
  const { manifest, hairColors } = useAvatarManifest()
  const [config, setConfig] = useState<AvatarConfig>(defaultAvatarConfig)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hairColors.length) return
    setConfig((prev) => {
      if (hairColors.includes(prev.hairColor)) return prev
      const fallback = hairColors.includes("castanho")
        ? "castanho"
        : (hairColors[0] as HairColorId)
      return {
        ...prev,
        hairColor: fallback,
        hairStyleIndex: clampHairStyle(prev.hairStyleIndex, fallback, manifest),
      }
    })
  }, [manifest, hairColors])

  useEffect(() => {
    const total = accessoriesCount(manifest)
    setConfig((prev) => {
      if (prev.accessoriesIndex <= total) return prev
      return { ...prev, accessoriesIndex: 0 }
    })
  }, [manifest])

  const update = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "hairColor") {
        next.hairStyleIndex = clampHairStyle(prev.hairStyleIndex, value as HairColorId, manifest)
      }
      return next
    })
  }, [manifest])

  const handleRandomize = () => setConfig(randomAvatarConfig(manifest))
  const handleReset = () => setConfig(defaultAvatarConfig)

  const handleDownload = async () => {
    const sources = getLayerSources(config, manifest)
    const size = 1024
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#faf7f2"
    ctx.fillRect(0, 0, size, size)

    for (const layer of sources) {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = layer.src
      })
      const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      const x = (size - w) / 2
      const y = (size - h) / 2
      ctx.drawImage(img, x, y, w, h)
    }

    const link = document.createElement("a")
    link.download = "avatar.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const hairStyles = Array.from(
    { length: hairStyleCount(config.hairColor, manifest) },
    (_, i) => i + 1,
  )
  const accessoryOptions = manifest.files?.accessories ?? []
  const accessoryTotal = accessoriesCount(manifest)

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
      <div className="flex flex-col items-center justify-center">
        <div className="mx-auto flex justify-center rounded-[32px] bg-[#faf7f2] p-6">
          <AvatarLayers ref={previewRef} config={config} manifest={manifest} />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-5 border border-foreground/10 bg-white shadow-sm hover:bg-accent hover:text-accent-foreground"
            onClick={handleRandomize}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><polyline points="16 3 21 3 21 8"/><line x1="4" x2="21" y1="20" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" x2="21" y1="15" y2="21"/><line x1="4" x2="9" y1="4" y2="9"/></svg>
            Aleatório
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9 border border-foreground/10 bg-white shadow-sm hover:bg-accent hover:text-accent-foreground"
            onClick={handleReset}
            aria-label="Reiniciar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button 
            type="button" 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-5 bg-primary text-primary-foreground shadow flex-shrink-0 hover:bg-primary/90" 
            onClick={handleDownload}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Baixar PNG
          </button>
        </div>
      </div>

      <div className="space-y-8 rounded-[2rem] border border-foreground/5 bg-white/80 p-6 backdrop-blur-sm lg:p-8">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Personalizar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rosto fixo · layers em tempo real
          </p>
        </div>

        <Section title="Pele">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {Array.from({ length: SKIN_COUNT }, (_, i) => i + 1).map((index) => (
              <ThumbnailOption
                key={index}
                src={skinPath(index)}
                selected={config.skinIndex === index}
                onClick={() => update("skinIndex", index)}
                label={`Pele ${index}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Boca">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: MOUTH_COUNT }, (_, i) => i + 1).map((index) => (
              <ThumbnailOption
                key={index}
                src={mouthPath(index)}
                selected={config.mouthIndex === index}
                onClick={() => update("mouthIndex", index)}
                label={`Boca ${index}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Brilho dos olhos">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: EYES_COUNT }, (_, i) => i + 1).map((index) => (
              <ThumbnailOption
                key={index}
                src={eyesPath(index)}
                selected={config.eyesIndex === index}
                onClick={() => update("eyesIndex", index)}
                label={`Olhos ${index}`}
              />
            ))}
          </div>
        </Section>

        <Section title="Cabelo · cor">
          <div className="flex flex-wrap gap-2">
            {hairColors.map((colorId) => (
              <ColorOption
                key={colorId}
                colorId={colorId}
                selected={config.hairColor === colorId}
                onClick={() => update("hairColor", colorId)}
              />
            ))}
          </div>
        </Section>

        <Section title="Cabelo · penteado">
          <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
            {hairStyles.map((index) => (
              <ThumbnailOption
                key={`${config.hairColor}-${index}`}
                src={hairPath(config.hairColor, index, manifest)}
                selected={config.hairStyleIndex === index}
                onClick={() => update("hairStyleIndex", index)}
                label={`Penteado ${index}`}
              />
            ))}
          </div>
        </Section>

        {CLOTHES_COUNT > 0 && (
          <Section title="Roupa">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: CLOTHES_COUNT }, (_, i) => i + 1).map((index) => (
                <ThumbnailOption
                  key={index}
                  src={`/clothes/clothes-${String(index).padStart(2, "0")}.png`}
                  selected={config.clothesIndex === index}
                  onClick={() => update("clothesIndex", index)}
                  label={`Roupa ${index}`}
                />
              ))}
            </div>
          </Section>
        )}

        {accessoryTotal > 0 && (
          <Section title="Presilhas">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              <NoneOption
                selected={config.accessoriesIndex === 0}
                onClick={() => update("accessoriesIndex", 0)}
              />
              {accessoryOptions.map((src, i) => {
                const index = i + 1
                return (
                  <ThumbnailOption
                    key={src}
                    src={accessoriesPath(index, manifest)}
                    selected={config.accessoriesIndex === index}
                    onClick={() => update("accessoriesIndex", index)}
                    label={`Presilha ${index}`}
                  />
                )
              })}
            </div>
          </Section>
        )}

        {BRUSH_COUNT > 0 && (
          <Section title="Escova / blush">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: BRUSH_COUNT }, (_, i) => i + 1).map((index) => (
                <ThumbnailOption
                  key={index}
                  src={`/brush/brush-${String(index).padStart(2, "0")}.png`}
                  selected={config.brushIndex === index}
                  onClick={() => update("brushIndex", index)}
                  label={`Blush ${index}`}
                />
              ))}
            </div>
          </Section>
        )}

        {CLOTHES_COUNT === 0 && BRUSH_COUNT === 0 && accessoryTotal === 0 && (
          <p className="text-xs text-muted-foreground">
            Adicione PNGs em <code className="text-foreground/70">public/clothes</code> ou{" "}
            <code className="text-foreground/70">public/brush</code> para ativar essas layers.
          </p>
        )}
      </div>
    </div>
  )
}
