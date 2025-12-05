import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'

import type { Env } from '../env'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<Env, true>,
  ) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true })
    const adapter = new PrismaPg({ connectionString: databaseUrl })

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
