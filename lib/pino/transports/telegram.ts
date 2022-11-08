import build from 'pino-abstract-transport'
import { code } from 'telegraf/format'
import type { Telegraf } from 'telegraf'

export const createTelegramTransportConfig = () => ({
  chatIds: <number[]>[],
  get bot(): Telegraf {
    return Reflect.get(this, '_bot')
  },
  set bot(t: Telegraf) {
    Reflect.set(this, '_bot', t)
  },
  addChatId(chatId: number) {
    this.chatIds.push(chatId)
  },
})

export const createTelegramTransport = (
  c: ReturnType<typeof createTelegramTransportConfig>
) => build(async (source) => {
  for await (const obj of source) {
    for (const chatId of c.chatIds) {
      c.bot.telegram.sendMessage(
        chatId,
        code(typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj)),
      )
    }
  }
})
