import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fed-secret'

export interface MemberPayload {
  id: number
  email: string
  name: string
  associationId: number
  type: 'member'
}

export interface PresidentPayload {
  id: number
  email: string
  name: string
  associationId: number
  role: 'president'
  type: 'president'
}

export function signMemberToken(payload: Omit<MemberPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'member' }, JWT_SECRET, { expiresIn: '7d' })
}

export function signPresidentToken(payload: Omit<PresidentPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'president' }, JWT_SECRET, { expiresIn: '7d' })
}

export function getMemberFromRequest(req: NextRequest): MemberPayload | null {
  const token = req.cookies.get('member_token')?.value
  if (!token) return null
  try {
    const p = jwt.verify(token, JWT_SECRET) as any
    return p.type === 'member' ? p : null
  } catch { return null }
}

export function getPresidentFromRequest(req: NextRequest): PresidentPayload | null {
  const token = req.cookies.get('president_token')?.value
  if (!token) return null
  try {
    const p = jwt.verify(token, JWT_SECRET) as any
    return p.type === 'president' ? p : null
  } catch { return null }
}
