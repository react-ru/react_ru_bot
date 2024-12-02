import pino from "pino";
import { Bot } from "./lib/bot";

const bot = new Bot({
  token: process.env["BOT_TOKEN"]!,
  logger: pino(),
  fastCache: { maxStoredExamples: 30 },
  recentMessages: { maxCount: 10 },
  spamCommandLockService: { lockDurationMs: 3600000 /* 1 hour */ },
  model: { modelId: 'react_ru' }
})

bot.launch()
