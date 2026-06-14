"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { BoothState, FilterId, FrameId, PlacedSticker } from "./booth-types"

const STORAGE_KEY = "polaroid-booth-state"

const defaultState: BoothState = {
  photos: [],
  filter: "classic",
  frame: "white",
  stickers: [],
  caption: "",
  date: "",
}

type BoothContextValue = {
  state: BoothState
  setPhotos: (photos: string[]) => void
  setFilter: (filter: FilterId) => void
  setFrame: (frame: FrameId) => void
  setStickers: (stickers: PlacedSticker[]) => void
  setCaption: (caption: string) => void
  reset: () => void
  ready: boolean
}

const BoothContext = createContext<BoothContextValue | null>(null)

export function BoothProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BoothState>(defaultState)
  const [ready, setReady] = useState(false)

  // hydrate from sessionStorage (so a strip survives page navigation)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) })
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore (e.g. quota)
    }
  }, [state, ready])

  const value = useMemo<BoothContextValue>(
    () => ({
      state,
      ready,
      setPhotos: (photos) =>
        setState((s) => ({
          ...s,
          photos,
          date:
            s.date ||
            new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
        })),
      setFilter: (filter) => setState((s) => ({ ...s, filter })),
      setFrame: (frame) => setState((s) => ({ ...s, frame })),
      setStickers: (stickers) => setState((s) => ({ ...s, stickers })),
      setCaption: (caption) => setState((s) => ({ ...s, caption })),
      reset: () => setState({ ...defaultState }),
    }),
    [state, ready],
  )

  return <BoothContext.Provider value={value}>{children}</BoothContext.Provider>
}

export function useBooth() {
  const ctx = useContext(BoothContext)
  if (!ctx) throw new Error("useBooth must be used within BoothProvider")
  return ctx
}
