import { Telegraf } from 'telegraf'

export const createBot = ({ token }: { token: string }) =>
  new Telegraf(token)
