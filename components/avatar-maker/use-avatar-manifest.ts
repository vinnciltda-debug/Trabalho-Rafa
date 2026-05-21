"use client"

import { useCallback, useEffect, useState } from "react"
import type { AvatarManifest } from "./avatar-assets"
import staticManifest from "@/public/avatar-manifest.json"

export function useAvatarManifest() {
  const [manifest, setManifest] = useState<AvatarManifest>(staticManifest as AvatarManifest)
  const [ready, setReady] = useState(false)

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`/avatar-manifest.json?t=${Date.now()}`, { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as AvatarManifest
      setManifest(data)
    } catch {
      // mantém manifest estático em build/offline
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const hairColors = Object.keys(manifest.hair).sort((a, b) => a.localeCompare(b, "pt"))

  return { manifest, hairColors, ready, reload }
}
