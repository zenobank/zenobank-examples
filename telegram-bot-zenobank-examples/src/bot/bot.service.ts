import { Injectable, Logger } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { ChatInviteLink } from "telegraf/typings/core/types/typegram";

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async sendMessage(props: { chatId: number | string; text: string }) {
    const { chatId, text } = props;
    await this.bot.telegram.sendMessage(chatId, text, { parse_mode: "HTML" });
  }

  async createInviteLink(props: {
    groupChatId: string;
  }): Promise<ChatInviteLink> {
    const { groupChatId } = props;
    const link = await this.bot.telegram.createChatInviteLink(groupChatId, {
      member_limit: 1,
    });
    return link;
  }

  async isGroupMember(props: {
    groupChatId: string;
    userId: number;
  }): Promise<boolean> {
    const { groupChatId, userId } = props;
    try {
      const member = await this.bot.telegram.getChatMember(groupChatId, userId);
      return ["member", "administrator", "creator"].includes(member.status);
    } catch {
      return false;
    }
  }

  async kickMember(props: {
    groupChatId: string;
    userId: number;
  }): Promise<void> {
    const { groupChatId, userId } = props;

    // ban to kick
    await this.bot.telegram.banChatMember(groupChatId, userId);
    // unban to allow them to rejoin if they pay again
    await this.bot.telegram.unbanChatMember(groupChatId, userId);
  }
}
