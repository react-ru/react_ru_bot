import pino from 'pino'
import pretty from 'pino-pretty'
import { telegramTransportConfig } from './telegramTransportConfig'
import { createTelegramTransport } from './transports/telegram'

export const logger = pino(
  { name: 'react_ru_bot' },
  pino.multistream([
    { stream: pretty({ colorize: true }) },
    { stream: createTelegramTransport(telegramTransportConfig) }
  ])
)
