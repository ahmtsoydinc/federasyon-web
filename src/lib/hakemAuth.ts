import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fed-secret'

export interface HakemPayload {
  id: number
  email: string
  name: string
  role: 'hakem'
  type: 'hakem'
}

export function signHakemToken(payload: Omit<HakemPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'hakem' }, JWT_SECRET, { expiresIn: '12h' })
}

export function getHakemFromRequest(req: NextRequest): HakemPayload | null {
  const token = req.cookies.get('hakem_token')?.value
  if (!token) return null
  try {
    const p = jwt.verify(token, JWT_SECRET) as any
    return p.type === 'hakem' ? p : null
  } catch { return null }
}
