import Link from "next/link"
import Image from "next/image"
import { Camera, Sparkles, Download, ArrowRight, BookOpen, PenLine, Sticker, Archive } from "lucide-react"
import { SiteNav } from "@/components/site-nav"

const steps = [
  {
    icon: Camera,
    title: "Open your camera",
    desc: "Allow webcam access and strike a pose. We capture four crisp frames in HD.",
  },
  {
    icon: Sparkles,
    title: "Filters & stickers",
    desc: "Apply dreamy vintage filters and drag cute stickers anywhere on your strip.",
  },
  {
    icon: Download,
    title: "Download your strip",
    desc: "Export a gorgeous high-resolution photo strip, ready to share or print.",
  },
]

const memoryBookSteps = [
  {
    icon: PenLine,
    title: "Start Your Page",
    desc: "Choose a journal style and begin your memory page.",
  },
  {
    icon: Sticker,
    title: "Decorate Your Memories",
    desc: "Add notes, photos, stickers, and cute details it maybe about you or a bday card.",
  },
  {
    icon: Archive,
    title: "Keep Every Chapter",
    desc: "Download and cherish your scrapbook pages forever.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-paper-grid">
      <SiteNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pt-12 pb-16 sm:pt-20">
        {/* floating stickers */}
        <span className="pointer-events-none absolute left-4 top-2 hidden -rotate-12 text-4xl sm:block">
          🌸
        </span>
        <span className="pointer-events-none absolute right-8 top-10 hidden rotate-12 text-4xl md:block">
          ☀️
        </span>
        <span className="pointer-events-none absolute right-1/3 bottom-4 hidden text-3xl lg:block">
          🎀
        </span>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <h1 className="mt-2 text-balance font-heading text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Memory Booth
            </h1>
            <p className="mt-4 font-handwriting text-4xl leading-none text-primary sm:text-5xl">
              For every version of you <span className="inline-block align-middle text-2xl sm:text-3xl">🎀</span>
            </p>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Capture moments, create nostalgic photo strips, and keep memories
              from every chapter of your story. <span className="text-primary">💌</span>
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/booth"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
              >
                <Camera className="size-5" />
                Start the Booth
              </Link>
              <Link
                href="/memory-book"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-card px-7 py-3.5 font-semibold text-primary shadow-sm transition-transform hover:scale-[1.03] hover:bg-primary/5 active:scale-95"
              >
                <BookOpen className="size-5" />
                Memory Book
              </Link>
            </div>

          </div>

          {/* sample strips */}
          <div className="relative flex justify-center gap-4">
            <div className="relative w-40 rotate-[-6deg] rounded-sm bg-card p-2 shadow-xl sm:w-48">
              <Image
                src="/strip-sample-1.png"
                alt="Sample photo strip with vintage filter and stickers"
                width={240}
                height={520}
                className="h-auto w-full rounded-sm"
                priority
              />
            </div>
            <div className="relative mt-10 w-40 rotate-[5deg] rounded-sm bg-card p-2 shadow-xl sm:w-48">
              <Image
                src="/strip-sample-2.png"
                alt="Sample photo strip of friends with cute stickers"
                width={240}
                height={520}
                className="h-auto w-full rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center font-heading text-3xl font-bold sm:text-4xl">
          How it <span className="italic text-primary">works</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          Three little steps between you and the cutest photo strip ever.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="absolute right-5 top-5 font-heading text-4xl font-bold text-accent">
                {i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-heading text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/booth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          >
            Enter the booth
            <ArrowRight className="size-5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {memoryBookSteps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="absolute right-5 top-5 font-heading text-4xl font-bold text-accent">
                {i + 1}.
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-heading text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/memory-book"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-card px-8 py-4 text-lg font-semibold text-primary shadow-sm transition-transform hover:scale-[1.03] hover:bg-primary/5 active:scale-95"
          >
            Enter the book
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Memory Booth-For every version of you <span className="text-primary">❤️</span>
      </footer>
    </main>
  )
}
