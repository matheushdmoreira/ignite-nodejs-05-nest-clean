import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'

import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(ConfigService)
    config: EnvService,
  ) {
    const databaseUrl = config.get('DATABASE_URL')
    const databaseSchema = config.get('DATABASE_SCHEMA')

    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      { schema: databaseSchema },
    )

    super({
      adapter,
      log: ['warn', 'error'],
    })
  }

  async onModuleInit() {
    return await this.$connect()
  }

  async onModuleDestroy() {
    return await this.$disconnect()
  }
}
