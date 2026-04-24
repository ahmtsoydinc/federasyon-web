import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, requireAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

// Bağlam bazlı boyutlandırma profilleri
const PROFILES: Record<string, { width: number; height: number; fit: 'cover' | 'inside' | 'contain'; quality: number }> = {
  slider:    { width: 1920, height: 1080, fit: 'inside', quality: 85 }, // slider: tam görüntü (kırpma yok)
  thumbnail: { width: 900,  height: 600,  fit: 'cover',  quality: 82 }, // haber/sayfa görseli
  avatar:    { width: 400,  height: 400,  fit: 'cover',  quality: 80 }, // kişi fotoğrafı
  logo:      { width: 500,  height: 300,  fit: 'inside', quality: 90 }, // sponsor logosu (oran korunur)
  default:   { width: 1200, height: 900,  fit: 'inside', quality: 82 }, // belirsiz bağlam
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!requireAdmin(user)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) || req.nextUrl.searchParams.get('type') || 'default'

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const inputBuffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  // Resim değilse (PDF, Word vb.) boyutlandırma yapmadan direkt kaydet
  if (!file.type.startsWith('image/')) {
    const ext = path.extname(file.name) || '.bin'
    const filename = `${uuidv4()}${ext}`
    await writeFile(path.join(uploadDir, filename), inputBuffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  }

  // SVG ise boyutlandırma yapma
  if (file.type === 'image/svg+xml') {
    const filename = `${uuidv4()}.svg`
    await writeFile(path.join(uploadDir, filename), inputBuffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  }

  // Resim: boyutlandır + WebP'ye dönüştür
  const profile = PROFILES[type] || PROFILES.default
  const originalSize = inputBuffer.length
  const meta = await sharp(inputBuffer).metadata()

  const outputBuffer = await sharp(inputBuffer)
    .resize(profile.width, profile.height, {
      fit: profile.fit,
      withoutEnlargement: true, // küçük resimleri büyütme
    })
    .webp({ quality: profile.quality })
    .toBuffer()

  const filename = `${uuidv4()}.webp`
  await writeFile(path.join(uploadDir, filename), outputBuffer)

  const newMeta = await sharp(outputBuffer).metadata()
  const newSize = outputBuffer.length
  const savedPercent = Math.round((1 - newSize / originalSize) * 100)

  return NextResponse.json({
    url: `/uploads/${filename}`,
    original: { width: meta.width, height: meta.height, size: originalSize },
    optimized: { width: newMeta.width, height: newMeta.height, size: newSize },
    savedPercent: savedPercent > 0 ? savedPercent : 0,
  })
}
