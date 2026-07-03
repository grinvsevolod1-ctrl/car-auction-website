import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Oswald, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Oswald({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const sans = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'IGNIS — Автоаукцион №1 в Беларуси',
  description:
    'IGNIS — премиальный онлайн-аукцион автомобилей в Беларуси. Живые торги, проверенные лоты, прозрачные ставки и доставка под ключ.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#141210',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable} ${mono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
