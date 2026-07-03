import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { join, extname } from 'path'
import { getSession } from '@/lib/auth/session'
import { guard } from '@/lib/security'
import { RATE_LIMITS } from '@/lib/config'

export const dynamic = 'force-dynamic'

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'])
const MAX_BYTES = 8 * 1024 * 1024 // 8 МБ
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const g = await guard('upload', RATE_LIMITS.upload.limit, RATE_LIMITS.upload.windowSec)
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: 429 })

  const form = await req.formData()
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: 'Файлы не переданы' }, { status: 400 })
  }

  await mkdir(UPLOAD_DIR, { recursive: true })
  const urls: string[] = []

  for (const file of files) {
    const ext = extname(file.name).toLowerCase()
    if (!ALLOWED.has(ext)) {
      return NextResponse.json(
        { error: `Недопустимый формат: ${file.name}` },
        { status: 400 },
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Файл слишком большой (макс. 8 МБ): ${file.name}` },
        { status: 400 },
      )
    }

    const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(UPLOAD_DIR, name), buffer)
    urls.push(`/uploads/${name}`)
  }

  return NextResponse.json({ urls })
}
