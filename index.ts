import { Telegraf } from 'telegraf'
import pino from 'pino'
import { titorelli } from './lib'

const bot = new Telegraf(process.env["BOT_TOKEN"]!)
const logger = pino()

bot.use((ctx) => {
  if ('message' in ctx.update) {
    if ('text' in ctx.update.message) {
      const { text, message_id } = ctx.update.message

      titorelli.predict({ text })
        .then(({ value: category }) => {
          logger.info("Message \"%s\" classifed as \"%s\"", text, category)

          if (category === 'spam') {
            return ctx.deleteMessage(message_id)
          }
        })
        .catch(e => console.error(e))
    }
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
