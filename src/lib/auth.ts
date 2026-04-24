import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fed-secret'

export interface JWTPayload {
  id: number
  email: string
  name: string
  role: string
  permissions: string[] // superadmin → tüm erişim, editor → sadece listelenenler
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    // Eski token'lar permissions içermeyebilir
    if (!decoded.permissions) decoded.permissions = []
    return decoded
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('authorization')
  const cookieToken = req.cookies.get('admin_token')?.value

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : cookieToken

  if (!token) return null
  return verifyToken(token)
}

export function requireAdmin(user: JWTPayload | null): boolean {
  return user !== null
}

export function requireSuperAdmin(user: JWTPayload | null): boolean {
  return user !== null && user.role === 'superadmin'
}

/** Kullanıcının belirli bir modüle erişimi var mı? */
export function hasPermission(user: JWTPayload | null, module: string): boolean {
  if (!user) return false
  if (user.role === 'superadmin') return true
  return user.permissions.includes(module)
}
