'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Loader2, Plus } from 'lucide-react'

export function ImageUploader({ initial = [] }: { initial?: string[] }) {
  const [images, setImages] = useState<string[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlDraft, setUrlDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('files', f))
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Ошибка загрузки')
      setImages((prev) => [...prev, ...(data.urls as string[])])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function remove(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  function makeMain(url: string) {
    setImages((prev) => [url, ...prev.filter((u) => u !== url)])
  }

  function addUrl() {
    const v = urlDraft.trim()
    if (!v) return
    setImages((prev) => (prev.includes(v) ? prev : [...prev, v]))
    setUrlDraft('')
  }

  return (
    <div>
      {/* Значение для server action */}
      <input type="hidden" name="images" value={images.join('\n')} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? 'Загрузка…' : 'Загрузить фото'}
        </button>
        <span className="text-xs text-muted-foreground">
          JPG, PNG, WEBP до 8 МБ. Первое фото — главное.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Добавление по URL */}
      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              addUrl()
            }
          }}
          placeholder="…или вставьте URL изображения"
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          <Plus className="size-4" />
          Добавить
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Фото ${i + 1}`}
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                  Главное
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-foreground/70 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeMain(url)}
                    className="inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground"
                  >
                    <Star className="size-3" />
                    Главное
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="ml-auto inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[11px] font-semibold text-destructive-foreground"
                >
                  <X className="size-3" />
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
