"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { JOURNAL_TEMPLATES, type JournalTemplate } from "@/lib/memory-book-types"

interface TemplatPickerProps {
  selected: JournalTemplate | null
  onSelect: (t: JournalTemplate) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatPickerProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold">Choose your journal style</h2>
        <p className="mt-2 text-muted-foreground">
          Pick a paper that speaks to your vibe 🌸
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:gap-8">
        {JOURNAL_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border-2 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl",
              selected?.id === t.id
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="relative h-64 w-48 sm:h-80 sm:w-60">
              <Image
                src={t.src}
                alt={t.label}
                fill
                className="object-cover"
              />
              {selected?.id === t.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>
            <div className="bg-card px-4 py-3 text-left">
              <p className="font-heading text-base font-semibold">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <p className="font-handwriting text-2xl text-primary animate-in fade-in">
          Perfect choice! Start decorating ✨
        </p>
      )}
    </div>
  )
}
