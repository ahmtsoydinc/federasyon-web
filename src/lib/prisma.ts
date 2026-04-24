import { PrismaClient } from '../../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? ''

  let config: { url: string; authToken?: string }

  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // Turso cloud veritabanı
    config = {
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    }
  } else if (dbUrl.startsWith('file:')) {
    // Local SQLite — mutlak yola çevir
    const relativePath = dbUrl.slice(5)
    const absolutePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath)
    config = { url: `file:${absolutePath}` }
  } else {
    // Varsayılan: proje kökündeki dev.db
    config = { url: `file:${path.join(process.cwd(), 'dev.db')}` }
  }

  const adapter = new PrismaLibSql(config)
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
