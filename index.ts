import {
  middlewares,
  createBot,
  getOptions,
  pino
} from './lib'

const bootstrap = async () => {
  const { token } = await getOptions()
  const bot = createBot({ token })

  // bot.use(Telegraf.log())
  bot.use(middlewares.useTotem())
  bot.use(middlewares.useAntispam())

  {
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
  }

  {
    pino.telegramTransportConfig.bot = bot

    for (const chatId of process.env['LOG_TO_CHAT_IDS']?.split(',') ?? []) {

      pino.telegramTransportConfig.addChatId(Number(chatId))
    }

    bot.command('/send_logs_here', (update) => {
      pino.telegramTransportConfig.addChatId(update.chat.id)
    })
  }

  return await bot.launch()
}

bootstrap()
