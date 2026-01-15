import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import { PrismaClient } from 'generated/prisma/client'
import { Redis } from 'ioredis'
import { DomainEvents } from '@/core/events/domain-events'
import { envSchema } from '@/infra/env/env'

config({ path: '.env', override: true, quiet: true })
config({ path: '.env.test', override: true, quiet: true })

const env = envSchema.parse(process.env)
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
})

if (!env.DATABASE_URL || !env.DATABASE_SCHEMA) {
  throw new Error(
    'Please provider a DATABASE_URL or DATABASE_SCHEMA environment variable',
  )
}

let prisma: PrismaClient

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(env.DATABASE_URL!)

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

  DomainEvents.shouldRun = false

  await redis.flushdb()

  execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
