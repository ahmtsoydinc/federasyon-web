import { NextRequest, NextResponse } from 'next/server'
import { getHakemFromRequest } from '@/lib/hakemAuth'

export async function GET(req: NextRequest) {
  const hakem = getHakemFromRequest(req)
  if (!hakem) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  return NextResponse.json({ hakem: { id: hakem.id, name: hakem.name, email: hakem.email } })
}
