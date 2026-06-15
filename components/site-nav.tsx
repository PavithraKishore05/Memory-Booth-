"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/booth", label: "The Booth" },
  { href: "/memory-book", label: "Memory Book" },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-4 z-40 px-4">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-border bg-card/80 px-3 py-2 shadow-sm backdrop-blur-md sm:px-5">
        <Link href="/" className="font-heading text-sm sm:text-lg font-bold tracking-tight shrink-0">
          Memory Booth<span className="text-primary">.</span>
        </Link>
        <ul className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 font-medium transition-colors block text-center whitespace-nowrap",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
