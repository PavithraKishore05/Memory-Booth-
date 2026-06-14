"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Camera,
  RefreshCw,
  Timer,
  X,
  Check,
  Upload,
  ExternalLink,
} from "lucide-react"
import { FILTERS, type FilterId } from "@/lib/booth-types"
import { cn } from "@/lib/utils"
import { fileToSquareDataUrl, toSquareDataUrl } from "@/lib/image-utils"

type Props = {
  filter: FilterId
  onComplete: (photos: string[]) => void
  shots?: number
}

const COUNTDOWN_OPTIONS = [3, 5, 10] as const

export function CameraCapture({ filter, onComplete, shots = 4 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "loading",
  )
  const [errorMsg, setErrorMsg] = useState("")
  const [inIframe, setInIframe] = useState(false)
  const [countdownLength, setCountdownLength] = useState<number>(3)
  const [count, setCount] = useState<number | null>(null)
  const [shooting, setShooting] = useState(false)
  const [captured, setCaptured] = useState<string[]>([])
  const [flash, setFlash] = useState(false)
  const [mirror, setMirror] = useState(true)

  const filterCss = FILTERS.find((f) => f.id === filter)?.css ?? "none"
  const photoLabel = shots === 1 ? "photo" : "photos"
  const shotLabel = shots === 1 ? "shot" : "shots"

  const startCamera = useCallback(async () => {
    setStatus("loading")
    setErrorMsg("")
    if (typeof window !== "undefined") {
      setInIframe(window.self !== window.top)
    }
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("error")
      setErrorMsg(
        "Your browser doesn't expose camera access here. This usually happens inside a preview frame — open this page in its own browser tab to use the camera.",
      )
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setStatus("ready")
    } catch (err) {
      const name = (err as Error)?.name
      console.log("[v0] camera error:", name, (err as Error)?.message)
      setStatus("error")
      if (name === "NotAllowedError" || name === "SecurityError") {
        setErrorMsg(
          "Camera permission was blocked. If you're viewing this inside a preview frame, open the page in its own tab, then allow camera access when prompted.",
        )
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setErrorMsg(
          "We couldn't find a camera on this device. You can upload photos instead.",
        )
      } else if (name === "NotReadableError") {
        setErrorMsg(
          "Your camera is being used by another app. Close it and try again, or upload photos instead.",
        )
      } else {
        setErrorMsg(
          "We couldn't access your camera. Open this page in its own browser tab, or upload photos instead.",
        )
      }
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [startCamera])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return null
    return toSquareDataUrl(video, video.videoWidth, video.videoHeight, mirror)
  }, [mirror])

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const selected = Array.from(files).slice(0, shots)
      const results = await Promise.all(selected.map(fileToSquareDataUrl))
      const photos = Array.from({ length: shots }, (_, index) => results[index] ?? "")
      if (!photos.some(Boolean)) return
      onComplete(photos)
    },
    [shots, onComplete],
  )

  const runCountdown = useCallback(
    (seconds: number) =>
      new Promise<void>((resolve) => {
        let remaining = seconds
        setCount(remaining)
        const tick = () => {
          remaining -= 1
          if (remaining > 0) {
            setCount(remaining)
            timeout = setTimeout(tick, 1000)
          } else {
            setCount(null)
            resolve()
          }
        }
        let timeout = setTimeout(tick, 1000)
      }),
    [],
  )

  const startSequence = useCallback(async () => {
    if (shooting || status !== "ready") return
    setShooting(true)
    setCaptured([])
    const photos: string[] = []
    for (let i = 0; i < shots; i++) {
      await runCountdown(countdownLength)
      // flash
      setFlash(true)
      const frame = captureFrame()
      setTimeout(() => setFlash(false), 180)
      if (frame) {
        photos.push(frame)
        setCaptured([...photos])
      }
      // brief pause between shots
      await new Promise((r) => setTimeout(r, 800))
    }
    setShooting(false)
    if (photos.length) onComplete(photos)
  }, [
    shooting,
    status,
    shots,
    countdownLength,
    runCountdown,
    captureFrame,
    onComplete,
  ])

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-3xl border-4 border-card bg-foreground/90 shadow-xl sm:max-w-xs">
        <div className="relative aspect-square w-full">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noplaybackrate noremoteplayback"
            muted
            className={cn(
              "size-full object-cover transition-[filter] duration-300",
              mirror && "-scale-x-100",
            )}
            style={{ filter: filterCss }}
          />

          {/* flash overlay */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-background transition-opacity duration-150",
              flash ? "opacity-90" : "opacity-0",
            )}
          />

          {/* countdown */}
          {count !== null && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="font-heading text-[4.5rem] font-bold text-primary-foreground drop-shadow-lg sm:text-[5.5rem]">
                {count}
              </span>
            </div>
          )}

          {/* shot progress */}
          {shooting && (
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1.5">
              {Array.from({ length: shots }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-2.5 rounded-full ring-1 ring-background/40",
                    i < captured.length ? "bg-primary" : "bg-background/50",
                  )}
                />
              ))}
            </div>
          )}

          {/* loading / error states */}
          {status !== "ready" && (
            <div className="absolute inset-0 grid place-items-center bg-foreground/80 p-6 text-center text-background">
              {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="size-7 animate-spin" />
                  <p className="text-sm">Warming up the camera…</p>
                </div>
              )}
              {status === "error" && (
                <div className="flex max-w-sm flex-col items-center gap-3">
                  <X className="size-7 text-primary" />
                  <p className="text-sm leading-relaxed">{errorMsg}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      <RefreshCw className="size-4" /> Try again
                    </button>
                    {inIframe && (
                      <a
                        href="/booth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-background/40 px-4 py-2 text-sm font-semibold text-background"
                      >
                        <ExternalLink className="size-4" /> Open in new tab
                      </a>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full border border-background/40 px-4 py-2 text-sm font-semibold text-background"
                    >
                      <Upload className="size-4" /> Upload photos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="mx-auto flex w-full max-w-[280px] flex-col gap-4 sm:max-w-xs">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <span className="px-2 text-muted-foreground">
              <Timer className="size-4" />
            </span>
            {COUNTDOWN_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setCountdownLength(opt)}
                disabled={shooting}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  countdownLength === opt
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt}s
              </button>
            ))}
          </div>

          <button
            onClick={() => setMirror((m) => !m)}
            disabled={shooting}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className="size-4" />
            {mirror ? "Mirrored" : "Normal"}
          </button>
        </div>

        <button
          onClick={startSequence}
          disabled={status !== "ready" || shooting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-60"
        >
          {shooting ? (
            <>
              <Camera className="size-5" />
              Capturing {captured.length}/{shots}…
            </>
          ) : captured.length ? (
            <>
              <Check className="size-5" />
              Retake {shots} {photoLabel}
            </>
          ) : (
            <>
              <Camera className="size-5" />
              Take {shots} {shotLabel}
            </>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll snap {shots} {shotLabel} with a {countdownLength}s countdown
          between each. Strike a pose!
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>No camera?</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 font-semibold text-primary underline-offset-4 hover:underline"
          >
            <Upload className="size-3.5" /> Upload {shots} {photoLabel}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}
