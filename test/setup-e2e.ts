import { config } from 'dotenv'

import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'

config({ path: '.env', override: true, quiet: true })
config({ path: '.env.test', override: true, quiet: true })

if (!process.env.DATABASE_URL || !process.env.DATABASE_SCHEMA) {
  throw new Error(
    'Please provider a DATABASE_URL or DATABASE_SCHEMA environment variable',
  )
}

let prisma: PrismaClient

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(process.env.DATABASE_URL!)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL
  process.env.DATABASE_SCHEMA = schemaId

  const adapter = new PrismaPg({ connectionString: databaseURL })
  prisma = new PrismaClient({
    adapter,
  })

  execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
