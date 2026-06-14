import type { JournalEl, JournalTemplate } from "./memory-book-types"

export async function renderJournalToCanvas(
  elements: JournalEl[],
  template: JournalTemplate,
  width: number,
  height: number
): Promise<string> {
  const canvas = document.createElement("canvas")
  const dpr = 2
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext("2d")!
  ctx.scale(dpr, dpr)

  const bg = await loadImg(template.src)
  ctx.drawImage(bg, 0, 0, width, height)

  const sorted = [...elements].sort((a, b) => a.z - b.z)

  for (const el of sorted) {
    ctx.save()
    const cx = el.x + el.w / 2
    const cy = el.y + el.h / 2
    ctx.translate(cx, cy)
    ctx.rotate((el.rotation * Math.PI) / 180)

    if (el.kind === "text") {
      const w = el.bold ? "bold" : "normal"
      const s = el.italic ? "italic" : "normal"
      ctx.font = `${s} ${w} ${el.fontSize}px ${el.fontFamily}`
      ctx.fillStyle = el.color
      ctx.textAlign = el.align as CanvasTextAlign
      const x = el.align === "center" ? 0 : el.align === "right" ? el.w / 2 : -el.w / 2
      el.content.split("\n").forEach((line, i) => {
        ctx.fillText(line, x, -el.h / 2 + el.fontSize * (i + 1))
      })
    } else if (el.kind === "sticker") {
      ctx.font = `${el.fontSize}px serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(el.emoji, 0, 0)
    } else if (el.kind === "image") {
      const img = await loadImg(el.src)
      ctx.drawImage(img, -el.w / 2, -el.h / 2, el.w, el.h)
    }

    ctx.restore()
  }

  return canvas.toDataURL("image/jpeg", 0.93)
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}
