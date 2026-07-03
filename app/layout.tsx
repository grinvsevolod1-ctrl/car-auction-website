import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Oswald, Inter, JetBrains_Mono } from 'next/font/google'
import { siteUrl } from '@/lib/config'
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

const description =
  'IGNIS — онлайн-аукцион автомобилей в Беларуси. Прозрачные торги, проверенные лоты, честные ставки в реальном времени.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'IGNIS — автомобильный аукцион в Беларуси',
    template: '%s · IGNIS',
  },
  description,
  applicationName: 'IGNIS',
  keywords: [
    'автоаукцион',
    'аукцион авто',
    'купить авто Беларусь',
    'торги автомобили',
    'IGNIS',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'IGNIS',
    title: 'IGNIS — автомобильный аукцион в Беларуси',
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IGNIS — автомобильный аукцион',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IGNIS — автомобильный аукцион в Беларуси',
    description,
    images: ['/og-image.png'],
  },
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
      <head>
        {/* Yandex.Metrika counter */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110357572', 'ym');
            ym(110357572, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
        </Script>
        {/* /Yandex.Metrika counter */}
      </head>
      <body className="font-sans antialiased">
        {children}
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/110357572"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  )
}
