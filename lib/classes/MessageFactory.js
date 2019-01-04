const { Message } = require('../models/Message')

exports.MessageFactory = class MessageFactory {
  constructor({ bot }) {
    this.bot = bot
    Message.setTelegram(bot.telegram)
  }

  async fromContext(ctx) {
    let message = await Message.findOne({ message_id: ctx.message.message_id })
    if (message) {
      return Object.assign(message, ctx.message, {
        chat_id: ctx.chat.id
      })
    } else {
      return new Message({
        ...ctx.message,
        chat_id: ctx.chat.id
      })
    }
  }

  createNew(options) {
    const message = new Message(options)
    return message
  }
}
