import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const bot = app.get<Telegraf>(getBotToken());

  app.use(bot.webhookCallback('/api/webhook'));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
