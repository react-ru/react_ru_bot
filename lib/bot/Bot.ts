import { Telegraf } from "telegraf"
import { Logger } from "pino"
import { FastCache } from "../fast-cache"
import { RecentMessagesStore } from "../recent-messages"
import { SpamLockService } from "../spam-lock-service"
import { titorelli } from ".."
import { totemGetByTgUserId, totemDeleteByTgUserId, totemCreate } from "../persistence"
import { assignToTgUserId, getAssignedTimesByTgUserId } from "../persistence/blackMarks"
import { banCandidateCreate } from "../persistence/banCandidates"
import { exampleCreate, exampleUpdate } from "../persistence/examples"

export class Bot {
  private logger: Logger
  private token: string
  private fastCache: FastCache
  private recentMessages: RecentMessagesStore
  private spamCommandLockService: SpamLockService
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
  }) {
    this.logger = conf.logger
    this.token = conf.token
    this.fastCache = new FastCache(conf.fastCache.maxStoredExamples, 0, this.logger)
    this.recentMessages = new RecentMessagesStore(conf.recentMessages.maxCount, this.logger)
    this.spamCommandLockService = new SpamLockService(conf.spamCommandLockService.lockDurationMs, this.logger)
    this.ready = this.initialize()
  }

  async initialize() {
    const bot = this.bot = new Telegraf(this.token)

    bot.command('spam', async (ctx) => {
      const admins = await ctx.getChatAdministrators()

      const isAdmin = admins.some(admin => admin.user.id === ctx.from.id)

      if (isAdmin) {
        this.logger.info("Spam command received from admin = %s", ctx.from.username)

        const replyToMessageId = ctx.message.reply_to_message?.message_id

        if (!replyToMessageId) {
          this.logger.warn('spam command received but it\'s not in a reply')

          return
        }

        const originalMessage = this.recentMessages.findById(replyToMessageId)

        if (!originalMessage) {
          this.logger.warn('Original message for /spam command cannot be found (too old or cache was dropped)')

          return
        }

        const originalText = Reflect.get(originalMessage, 'text') as string

        if (!originalText) {
          this.logger.warn('Text of original message cannot be retrieved')

          return
        }

        await totemDeleteByTgUserId(originalMessage.from.id)
        await assignToTgUserId(originalMessage.from.id)
        await ctx.deleteMessage(replyToMessageId)
        await ctx.deleteMessage()

        this.logger.info(
          "Message '%s' deleted because of /spam commad from user %s",
          originalText,
          ctx.message.from.username || ctx.message.from.id
        )

        // TODO: Train titorelli classifier
      } else {
        if (this.spamCommandLockService.locked(ctx.from.id)) {
          this.logger.warn("spam command received, but user with id = %s locked", ctx.from.id)

          await ctx.deleteMessage()

          return
        }

        const replyToMessageId = ctx.message.reply_to_message?.message_id

        if (!replyToMessageId) {
          this.logger.warn('spam command received but it\'s not in a reply')

          return
        }

        const originalMessage = this.recentMessages.findById(replyToMessageId)

        if (!originalMessage) {
          this.logger.warn('Original message for /spam command cannot be found (too old or cache was dropped)')

          return
        }

        const originalText = Reflect.get(originalMessage, 'text') as string

        if (!originalText) {
          this.logger.warn('Text of original message cannot be retrieved')

          return
        }

        this.spamCommandLockService.lock(ctx.message.from.id)

        await totemDeleteByTgUserId(originalMessage.from.id)
        await assignToTgUserId(originalMessage.from.id)
        await ctx.deleteMessage(replyToMessageId)
        await ctx.deleteMessage()

        this.logger.info(
          "Message '%s' deleted because of /spam commad from user %s",
          originalText,
          ctx.message.from.username || ctx.message.from.id
        )
      }
    })

    bot.use(async (ctx) => {
      this.logger.info("Received update typed as \"%s\":", ctx.updateType)

      if ("message" in ctx.update) {
        if ("text" in ctx.update.message || 'caption' in ctx.update.message) {
          this.recentMessages.add(ctx.update.message)

          const text: string = Reflect.get(ctx.update.message, 'text') || Reflect.get(ctx.update.message, 'caption')

          if (!text) return

          const { message_id, from } = ctx.update.message;

          const exampleId = await exampleCreate(message_id, from, text)

          const fromId = from.id;

          {
            const blackMarks = await getAssignedTimesByTgUserId(fromId)

            if (blackMarks >= 3) {
              await banCandidateCreate(ctx.update.message.from)

              this.logger.info(
                'User %s marked as ban-candidate',
                ctx.message.from.username ?? ctx.message.from.id
              )

              await exampleUpdate(exampleId, {
                classifier: 'black-mark',
                label: 'spam',
                confidence: 1
              })

              await ctx.deleteMessage()

              this.logger.info('Message "%s" removed because author has %s black marks', text, blackMarks)

              return
            }
          }

          const totem = await totemGetByTgUserId(fromId);

          if (totem) {
            this.logger.info(
              'User with id = %s has totem, skipping. text = "%s"',
              fromId,
              text,
            );

            await exampleUpdate(exampleId, {
              classifier: 'totem',
              label: 'ham',
              confidence: 1
            })
          } else {
            {
              const label = this.fastCache.get({ text })

              if (label) {
                this.logger.info('Message "%s" fast-classified as "%s"', text, label)

                await exampleUpdate(exampleId, {
                  classifier: 'fast-classifier',
                  confidence: 1,
                  label
                })

                if (label === 'spam') {
                  await assignToTgUserId(fromId)
                  await ctx.deleteMessage(message_id)
                } else if (label === 'ham') {
                  // DO NOTHING
                }

                return
              }
            }

            {
              const { value: category, confidence } = await titorelli.client.predict({
                text,
                tgUserId: fromId
              });

              this.fastCache.add({ text, label: category })

              this.logger.info(
                'Message "%s" classifed as "%s" with confidence = %s',
                text,
                category,
                confidence,
              );

              await exampleUpdate(exampleId, {
                classifier: 'titorelli',
                confidence,
                label: category
              })

              if (category === "spam" && confidence > 0.3) {
                await assignToTgUserId(fromId)
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
