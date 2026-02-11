import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot/bot.update';
import { BotService } from './bot/bot.service';
import { PrismaService } from './prisma/prisma.service';
@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '8551716932:AAEiNYPgXaaYldctw8huIg89Bj3ccZT9ozk',
    }),
  ],
  providers: [BotUpdate, BotService, PrismaService],
})
export class AppModule {}
