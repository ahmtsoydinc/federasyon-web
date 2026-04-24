import { NextRequest, NextResponse } from 'next/server'
import { getPresidentFromRequest } from '@/lib/memberAuth'

export async function GET(req: NextRequest) {
  const president = getPresidentFromRequest(req)
  if (!president) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  return NextResponse.json({ president })
}
