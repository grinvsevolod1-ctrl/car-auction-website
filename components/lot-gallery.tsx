'use client'

import Image from 'next/image'
import { useState } from 'react'

export function LotGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const pics = images.length > 0 ? images : ['/cars/placeholder.png']
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src={pics[active] || "/placeholder.svg"}
          alt={`${title} — фото ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </div>

      {pics.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {pics.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-lg border transition-colors ${
                active === i ? 'border-primary' : 'border-border'
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <Image
                src={src || "/placeholder.svg"}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
