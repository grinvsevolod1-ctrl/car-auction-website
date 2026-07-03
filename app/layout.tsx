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
  title: {
    default: 'IGNIS — автомобильный аукцион в Беларуси',
    template: '%s · IGNIS',
  },
  description:
    'IGNIS — онлайн-аукцион автомобилей в Беларуси. Прозрачные торги, проверенные лоты, честные ставки в реальном времени.',
  keywords: [
    'автоаукцион',
    'аукцион авто',
    'купить авто Беларусь',
    'торги автомобили',
    'IGNIS',
  ],
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
