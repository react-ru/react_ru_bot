const { Chat } = require("../models/Chat");

exports.ChatFactory = class ChatFactory {
  constructor({ bot }) {
    this.bot = bot;
    Chat.setTelegram(bot.telegram);
  }

  async fromContext(ctx) {
    let chat = await Chat.findOne({ id: ctx.chat.id });
    const members_count = await ctx.telegram.getChatMembersCount(ctx.chat.id);
    if (chat) {
      return Object.assign(chat, ctx.chat, { members_count });
    } else {
      return new Chat({
        ...ctx.chat,
        members_count
      });
    }
  }
};
