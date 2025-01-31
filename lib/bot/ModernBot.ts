import { TitorelliClient } from "@titorelli/client"
import { telegrafMiddleware, TelemetryClient } from "@titorelli/telemetry-client"
import { BotCore } from '@titorelli/bot-core'
import { Logger } from "pino"
import { type Context, deunionize, Telegraf } from "telegraf"
import type { Update } from "telegraf/types"

export class ModernBot extends BotCore<Context<Update>> {
  private telemetry: TelemetryClient
  private token: string
  private telegraf: Telegraf

  constructor(
    {
      token,
      titorelli,
      telemetry,
      logger
    }: {
      token: string,
      titorelli: TitorelliClient
      telemetry: TelemetryClient
      logger: Logger,
    }) {
    super({ titorelli, logger })

    this.token = token
    this.telemetry = telemetry
    this.telegraf = new Telegraf(this.token)

    this.telegraf.use(telegrafMiddleware(this.telemetry))
    this.telegraf.use(async (ctx, next) => {
      await this.messageHandler(ctx)

      return next()
    })
  }

  protected async getTgChatId(ctx: Context<Update>): Promise<number> {
    return ctx.chat.id
  }

  protected getTextContent(ctx: Context<Update>): string | Promise<string> {
    return ctx.text || deunionize(ctx.message).caption
  }

  protected getTgFromUserId(ctx: Context<Update>): number | Promise<number> {
    return ctx.from.id
  }

  protected getTgMessageId(ctx: Context<Update>): number | Promise<number> {
    return ctx.message.message_id
  }

  protected async deleteMessage(tgChatId: number, tgMessageId: number): Promise<any> {
    return this.telegraf.telegram.deleteMessage(tgChatId, tgMessageId)
  }

  protected async banChatMember(tgChatId: number, tgMessageId: number): Promise<any> {
    return this.telegraf.telegram.banChatMember(tgChatId, tgMessageId)
  }
}
