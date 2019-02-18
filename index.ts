import { Telegraf } from 'telegraf'
import {
  middlewares,
  createBot,
  getOptions,
} from './lib'

const bootstrap = async () => {
  const { token } = await getOptions()
  const bot = createBot({ token })

  // bot.use(Telegraf.log())
  bot.use(middlewares.useAntispam())


  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  return await bot.launch()
}

bootstrap()
