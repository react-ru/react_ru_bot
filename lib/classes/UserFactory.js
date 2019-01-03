const { User } = require('../models/User')

exports.UserFactory = class UserFactory {
  constructor({ bot }) {
    this.bot = bot
    User.setTelegram(bot.telegram)
  }

  async fromContext(ctx) {
    let user = await User.findOne({ id: ctx.from.id })
    if (user) {
      return Object.assign(user, ctx.from)
    } else {
      return new User(ctx.from)
    }
  }
}
