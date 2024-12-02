import { TitorelliModelClient } from "@titorelli/client"
import { Logger } from "pino"
import { FastCache } from "../fast-cache"
import { RecentMessagesStore } from "../recent-messages"
import { SpamLockService } from "../spam-lock-service"
import { titorelli } from ".."
import { differenceInMinutes } from "date-fns"
import { totemGetByTgUserId, totemDeleteByTgUserId, totemCreate } from "../persistence"
import { Telegraf } from "telegraf"

export class Bot {
  private logger: Logger
  private token: string
  private fastCache: FastCache
  private recentMessages: RecentMessagesStore
  private spamCommandLockService: SpamLockService
  private model: TitorelliModelClient
  private bot: Telegraf
  private ready: Promise<void>

  constructor(conf: {
    logger: Logger,
    token: string
    fastCache: {
      maxStoredExamples: number
    }
    recentMessages: {
      maxCount: number
    }
    spamCommandLockService: {
      lockDurationMs: number
    }
    model: {
      modelId: string
    }
  }) {
    this.logger = conf.logger
    this.token = conf.token
    this.fastCache = new FastCache(conf.fastCache.maxStoredExamples, 0)
    this.recentMessages = new RecentMessagesStore(conf.recentMessages.maxCount)
    this.spamCommandLockService = new SpamLockService(conf.spamCommandLockService.lockDurationMs)
    this.model = titorelli.client.model(conf.model.modelId)
    this.ready = this.initialize()
  }

  async initialize() {
    const bot = this.bot = new Telegraf(this.token)

    bot.command('spam', async (ctx) => {
      if (this.spamCommandLockService.locked(ctx.from.id)) {
        this.logger.info("spam command issued, but user with id = %s locked", ctx.from.id)

        await ctx.deleteMessage()

        return
      }

      const replyToMessageId = ctx.message.reply_to_message?.message_id

      if (!replyToMessageId) return

      const originalMessage = this.recentMessages.findById(replyToMessageId)

      if (!originalMessage) {
        this.logger.info('Original message for /spam command cannot be found (too old or cache dropped)')

        return
      }

      const originalText = Reflect.get(originalMessage, 'text') as string
      const originalTotem = await totemGetByTgUserId(originalMessage.from.id)
      let toRemove = false;

      if (originalTotem && originalTotem.createdAt != null) {
        const totemCreatedAtDate = new Date(originalTotem.createdAt)
        const howOldInMinutes = differenceInMinutes(new Date(), totemCreatedAtDate)

        if (howOldInMinutes < 30) {
          toRemove = true
        }
      } else {
        toRemove = true
      }

      if (!toRemove) return

      this.logger.info(
        "Message '%s' deleted because of /spam commad from user %s",
        originalText,
        ctx.message.from.username || ctx.message.from.id
      )

      this.spamCommandLockService.lock(ctx.message.from.id)

      await totemDeleteByTgUserId(originalMessage.from.id)

      await ctx.deleteMessage(replyToMessageId)
      await ctx.deleteMessage()
    })

    bot.use(async (ctx) => {
      this.logger.info("Received update typed as \"%s\"", ctx.updateType)

      if ("message" in ctx.update) {
        if ("text" in ctx.update.message) {
          this.recentMessages.add(ctx.update.message)

          const { text, message_id } = ctx.update.message;
          const fromId = ctx.update.message.from.id;

          const totem = await totemGetByTgUserId(fromId);

          if (totem) {
            this.logger.info(
              'User with id = %s has totem, skipping. text = "%s"',
              fromId,
              text,
            );

            // Do nothing
          } else {
            {
              const label = this.fastCache.get({ text })

              if (label) {
                this.logger.info('Message "%s" fast-classified as "%s"', text, label)

                if (label === 'spam') {
                  await ctx.deleteMessage(message_id)
                } else if (label === 'ham') {
                  // DO NOTHING
                }

                return
              }
            }

            {
              const { value: category, confidence } = await this.model.predict({
                text,
              });

              this.fastCache.add({ text, label: category })

              this.logger.info(
                'Message "%s" classifed as "%s" with confidence = %s',
                text,
                category,
                confidence,
              );

              if (category === "spam" && confidence > 0.3) {
                await ctx.deleteMessage(message_id);

                return;
              } else if (category === "ham") {
                await totemCreate(fromId);

                return;
              }
            }
          }

          return;
        }
      }
    });
  }

  async launch() {
    await this.ready

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));

    return this.bot.launch();
  }
}
