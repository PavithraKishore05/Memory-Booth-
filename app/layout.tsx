import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Caveat } from 'next/font/google'
import { BoothProvider } from '@/components/booth-provider'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})
const caveat = Caveat({
  variable: '--font-handwriting',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Memory Booth — For every version of you',
  description:
    'Capture moments, create nostalgic photo strips, and keep memories from every chapter of your story.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdf6ed',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <BoothProvider>{children}</BoothProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
