import { Update, Start, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(ctx: Context) {
    const fromUser = ctx.from;
    if (fromUser) {
      await this.botService.saveUser(fromUser.id, fromUser.first_name);
    }
    // HTML mode သုံးရင် <b> သုံးလို့ရပါပြီ
    await ctx.reply(`<b>${this.botService.getHello()}</b>`, {
      parse_mode: 'HTML',
    });
  }

  @On('message')
  async onMessage(ctx: Context) {
    // text message ဟုတ်မဟုတ် စစ်ဆေးခြင်း

    const message = ctx.message as Message.TextMessage;
    const text = message.text;

    if (text.startsWith('/')) return;

    await ctx.reply(`🔎 Searching for "<b>${text}</b>"...`, {
      parse_mode: 'HTML',
    });

    const heroInfo = await this.botService.getHeroSpells(text);

    if (heroInfo) {
      const replyMessage = `🛡️ <b>Hero: ${heroInfo.name}</b>\n\n${heroInfo.spells}`;

      // ၁။ ပုံကို အရင်ပို့ပါ (Caption မပါဘဲ)
      await ctx.replyWithPhoto(heroInfo.image);

      // ၂။ စာသားကို Message အနေနဲ့ သီးသန့်ပို့ပါ (စာအရှည်ကြီး လက်ခံနိုင်သည်)
      await ctx.reply(replyMessage, {
        parse_mode: 'HTML',
      });
    } else {
      await ctx.reply(
        '❌ <b>Hero not found.</b>\n\nPlease check the spelling and try again. (e.g., <i>Pudge, Axe, or Anti-Mage</i>)',
        { parse_mode: 'HTML' },
      );
    }
  }
}
