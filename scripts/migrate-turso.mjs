// Turso DB'ye yeni tabloları uygular
import { createClient } from '@libsql/client'
import 'dotenv/config'

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

const statements = [
  `CREATE TABLE IF NOT EXISTS "Competition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "registrationStart" DATETIME NOT NULL,
    "registrationEnd" DATETIME NOT NULL,
    "eventDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "CollectionGroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competitionId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "groupNumber" INTEGER NOT NULL,
    "groupScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionGroup_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CollectionGroup_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "CompetitionAnimal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competitionId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "animalType" TEXT NOT NULL,
    "breed" TEXT,
    "gender" TEXT,
    "species" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "braceletYear" INTEGER,
    "braceletNumber" TEXT,
    "chipNumber" TEXT,
    "tattooLeftEar" TEXT,
    "tattooRightEar" TEXT,
    "birthMonth" INTEGER,
    "birthYear" INTEGER,
    "entryType" TEXT NOT NULL DEFAULT 'SINGLE',
    "collectionGroupId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionNote" TEXT,
    "presidentApprovedAt" DATETIME,
    "fedApprovedAt" DATETIME,
    "cageNumber" INTEGER,
    "cageAssignedAt" DATETIME,
    "individualScore" REAL,
    "judgeStrengths" TEXT,
    "judgeRecommendations" TEXT,
    "awards" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitionAnimal_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetitionAnimal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompetitionAnimal_collectionGroupId_fkey" FOREIGN KEY ("collectionGroupId") REFERENCES "CollectionGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "AnimalStandard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animalType" TEXT NOT NULL,
    "breed" TEXT,
    "species" TEXT NOT NULL,
    "color" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "AwardType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AwardType_name_key" ON "AwardType"("name")`,
  // Başlangıç ödülleri (seed)
  `INSERT OR IGNORE INTO "AwardType" ("name","active","order") VALUES
    ('Türkiye Şampiyonu', 1, 1),
    ('Salonun En İyisi', 1, 2),
    ('En İyi Tavuk', 1, 3),
    ('En İyi Horoz', 1, 4),
    ('Onur Ödülü', 1, 5),
    ('En İyi Koleksiyon', 1, 6),
    ('En İyi Tavşan Koleksiyon', 1, 7),
    ('En İyi Erkek Tavşan', 1, 8),
    ('En İyi Dişi Tavşan', 1, 9),
    ('En İyi Güvercin Koleksiyon', 1, 10),
    ('En İyi Erkek Güvercin', 1, 11),
    ('En İyi Dişi Güvercin', 1, 12)`,
]

console.log('Turso DB migration başlıyor...')
for (const sql of statements) {
  try {
    await client.execute(sql)
    const firstLine = sql.trim().split('\n')[0].substring(0, 60)
    console.log(`✓ ${firstLine}...`)
  } catch (err) {
    console.error(`✗ Hata: ${err.message}`)
    console.error(`  SQL: ${sql.substring(0, 80)}...`)
  }
}
console.log('Migration tamamlandı.')
