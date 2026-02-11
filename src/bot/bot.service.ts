import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

// --- Official API အတွက် Interface များ သတ်မှတ်ခြင်း ---

interface HeroListItem {
  id: number;
  name: string; // e.g. "npc_dota_hero_antimage"
  name_loc: string; // e.g. "Anti-Mage"
}

interface AbilityDetail {
  id: number;
  name: string;
  name_loc: string;
  desc_loc: string;
}

interface HeroDetail {
  id: number;
  name: string;
  name_loc: string;
  abilities: AbilityDetail[];
}

interface HeroListResponse {
  result: {
    data: {
      heroes: HeroListItem[];
    };
  };
}

interface HeroDetailResponse {
  result: {
    data: {
      heroes: HeroDetail[];
    };
  };
}

@Injectable()
export class BotService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return "👋 <b>Welcome to the Dota Codex!</b>\n\nSimply type a Hero's name (e.g., <i>Pudge, Axe, or Anti-Mage</i>) to see their abilities and lore. How can I help you today?";
  }

  async saveUser(telegramId: number, username: string) {
    const stringId = telegramId.toString();
    return await this.prisma.user.upsert({
      where: { telegramId: stringId },
      update: { username: username || 'Unknown' },
      create: { telegramId: stringId, username: username || 'Unknown' },
    });
  }

  private cleanText(text: string): string {
    return text
      ? text.replace(/<[^>]*>/g, '').trim()
      : 'No description available.';
  }

  async getHeroSpells(heroName: string) {
    try {
      const listUrl =
        'https://www.dota2.com/datafeed/herolist?language=english';

      // ✅ Generics <HeroListResponse> ကို သုံးလိုက်တဲ့အတွက် heroes ဟာ 'any' မဟုတ်တော့ပါဘူး
      const listResponse = await axios.get<HeroListResponse>(listUrl);
      const heroes = listResponse.data.result.data.heroes;

      const searchName = heroName.toLowerCase().trim();
      const hero = heroes.find(
        (h) =>
          h.name_loc.toLowerCase() === searchName ||
          h.name.replace('npc_dota_hero_', '') ===
            searchName.replace(/\s+/g, '_'),
      );

      if (!hero) return null;

      const detailUrl = `https://www.dota2.com/datafeed/herodata?language=english&hero_id=${hero.id}`;

      // ✅ Generics <HeroDetailResponse> ကို သုံးပြီး safety ဖြစ်အောင် လုပ်ပါတယ်
      const detailResponse = await axios.get<HeroDetailResponse>(detailUrl);
      const heroDetail = detailResponse.data.result.data.heroes[0];

      const imgKey = hero.name.replace('npc_dota_hero_', '');
      const imageUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${imgKey}.png`;

      const spells = heroDetail.abilities
        .map(
          (ability) =>
            `✨ <b>${ability.name_loc}</b>\n📖 ${this.cleanText(ability.desc_loc)}\n`,
        )
        .join('\n');

      return {
        name: hero.name_loc,
        spells: spells,
        image: imageUrl,
      };
    } catch (error) {
      console.error('Dota API Error:', error);
      return null;
    }
  }
}
