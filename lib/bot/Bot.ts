import { deunionize, Telegraf } from "telegraf"
import { Logger } from "pino"
import { RecentMessagesStore } from "../recent-messages"
import { SpamLockService } from "../spam-lock-service"
import { titorelli } from ".."
import { totemDeleteByTgUserId, totemCreate, totemGetByTgUserId } from "../persistence"
import { assignToTgUserId, getAssignedTimesByTgUserId } from "../persistence/blackMarks"
import { banCandidateCreate } from "../persistence/banCandidates"
import { exampleCreate, exampleUpdate } from "../persistence/examples"
import { casBannedCreate } from "../persistence/casBanned"
import { printUserName } from "../printUserName"

export class Bot {
  private logger: Logger
  private token: string
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

        const originalMessage = await this.recentMessages.findById(replyToMessageId)

        if (!originalMessage) {
          this.logger.warn('Original message for /spam command cannot be found (too old or cache was dropped)')

          return
        }

        const originalText = Reflect.get(originalMessage, 'text') as string

        if (!originalText) {
          this.logger.warn('Text of original message cannot be retrieved')

          return
        }

        await totemDeleteByTgUserId(originalMessage.tgUserId)
        await assignToTgUserId(originalMessage.tgUserId)
        await ctx.deleteMessage(replyToMessageId)
        await ctx.deleteMessage()

        this.logger.info(
          "Message '%s' deleted because of /spam commad from user %s",
          originalText,
          ctx.message.from.username || ctx.message.from.id
        )

        await titorelli.client.train({ text: originalMessage.text, label: 'spam' })
        await titorelli.client.duplicate.train({ text: originalMessage.text, label: 'spam' })
        await titorelli.client.cas.train({ tgUserId: originalMessage.tgUserId })
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

        const originalMessage = await this.recentMessages.findById(replyToMessageId)

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

        await totemDeleteByTgUserId(originalMessage.tgUserId)
        await assignToTgUserId(originalMessage.tgUserId)
        await ctx.deleteMessage(replyToMessageId)
        await ctx.deleteMessage()

        this.logger.info(
          "Message '%s' deleted because of /spam commad from user %s",
          originalText,
          ctx.message.from.username || ctx.message.from.id
        )
      }
    })

    bot.on('new_chat_members', async ctx => {
      this.logger.info({
        message: 'Join chat members',
        newChatMembers: deunionize(ctx).update.message.new_chat_members
      })

      const newChatMembers = deunionize(ctx).update.message.new_chat_members
      const admins = await ctx.getChatAdministrators()

      for (const user of newChatMembers) {
        {
          const isAdmin = admins.some(admin => admin.user.id === user.id)

          if (isAdmin) {
            this.logger.info('User "%s" passed, because he\'s admin', printUserName(user))

            continue
          }
        }

        {
          const hasTotem = await totemGetByTgUserId(user.id)

          if (hasTotem) {
            this.logger.info('User "%s" passed, because he has totem', printUserName(user))

            continue
          }
        }

        const { banned } = await titorelli.client.cas.predictCas({ tgUserId: user.id })

        this.logger.info('CAS predicted for user: %s = %s', printUserName(user), banned)

        if (banned) {
          this.logger.info('User "%s" banned because he\'s known spammer', printUserName(user))

          await ctx.banChatMember(user.id)
          await casBannedCreate(user)
        }
      }
    })

    bot.on('left_chat_member', async ctx => {
      this.logger.info({
        message: 'Left chat members',
        leftChatMembers: deunionize(ctx).update.message.left_chat_member
      })
    })

    // bot.on('chat_member', async ctx => {
    //   this.logger.info('on chat_member:')
    //   this.logger.info(ctx)

    //   const admins = await ctx.getChatAdministrators()

    //   {
    //     const isAdmin = admins.some(admin => admin.user.id === ctx.from.id)

    //     if (isAdmin)
    //       return
    //   }

    //   {
    //     const hasTotem = totemGetByTgUserId(ctx.from.id)

    //     if (hasTotem)
    //       return
    //   }

    //   const { banned } = await titorelli.client.cas.predictCas({ tgUserId: ctx.from.id })

    //   if (banned) {
    //     await ctx.banChatMember(ctx.from.id)
    //     await casBannedCreate(ctx.from)
    //   }

    //   await ctx.deleteMessage()
    // })

    bot.on('message', async ctx => {
      this.logger.info("Received message")

      const text: string = Reflect.get(ctx.message, 'text') ?? Reflect.get(ctx.message, 'caption') ?? ''

      if (!text) {
        this.logger.warn('Received empty text message: ', ctx.message)

        return
      }

      const { message_id, from } = ctx.message
      const exampleId = await exampleCreate(message_id, from, text)
      const fromId = from.id

      const { reason, value: label, confidence } = await titorelli.client.predict({ text, tgUserId: fromId })

      await exampleUpdate(exampleId, {
        classifier: 'titorelli',
        reason,
        label: label,
        confidence
      })

      await titorelli.client.duplicate.train({ text, label })

      if (reason === 'totem') {
        this.logger.info('Message "%s" passed because sender has totem', text)

        return
      }

      if (reason === 'cas') {
        await ctx.deleteMessage()

        this.logger.info('Message "%s" deleted because of CAS ban', text)

        return
      }

      if (reason === 'duplicate') {
        if (label === 'spam') {
          await ctx.deleteMessage()

          await assignToTgUserId(fromId)

          if ((await getAssignedTimesByTgUserId(fromId)) >= 3) {
            await banCandidateCreate(from)
            await titorelli.client.cas.train({ tgUserId: fromId })
          }

          this.logger.info('Message "%s" removed as duplicate', text)

          await ctx.deleteMessage()

          return
        } else {
          this.logger.info('Message "%s" passed because it\'s duplicate but not spam', text)

          return
        }
      }

      if (reason === 'classifier') {
        if (label === 'ham') {
          this.logger.info('Message "%s" passed because it\'s classified as ham', text)

          await totemCreate(fromId)
          await titorelli.client.totems.train({ tgUserId: fromId })

          return
        } else
          if (label === 'spam') {
            this.logger.info('Message "%s" removed because it\'s classified as spam with score = %s', text, confidence)

            await ctx.deleteMessage()

            return
          }
      }
    })
  }

  async launch() {
    await this.ready

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));

    return this.bot.launch({
      allowedUpdates: [
        'chat_member',
        'new_chat_members' as any,
        'left_chat_member',
        'message'
      ]
    });
  }
}
