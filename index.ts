import { Telegraf } from "telegraf";
import pino from "pino";
import { titorelli } from "./lib";
import { totemCreate, totemDeleteByTgUserId, totemGetByTgUserId } from "./lib/persistence";
import { FastCache } from "./lib/fast-cache";
import { RecentMessagesStore } from "./lib/recent-messages";
import { differenceInMinutes } from "date-fns";

const bot = new Telegraf(process.env["BOT_TOKEN"]!);
const logger = pino();
const fastCache = new FastCache(30, 4)
const recentMessages = new RecentMessagesStore(30)
const ownModel = titorelli.client.model('react_ru')

bot.command('spam', async (ctx) => {
  const replyToMessageId = ctx.message.reply_to_message?.message_id

  if (!replyToMessageId) return

  const originalMessage = recentMessages.findById(replyToMessageId)
  const originalText = Reflect.get(originalMessage, 'text') as string
  const originalTotem = await totemGetByTgUserId(originalMessage.from.id)
  let toRemove = false

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

  logger.info(
    "Message '%s' deleted because of /spam commad from user %s",
    originalText,
    ctx.message.from.username || ctx.message.from.id
  )

  await totemDeleteByTgUserId(originalMessage.from.id)

  await ctx.deleteMessage(replyToMessageId)
  await ctx.deleteMessage()
})

bot.use(async (ctx) => {
  logger.info("Received update typed as \"%s\"", ctx.updateType)

  if ("message" in ctx.update) {
    if ("text" in ctx.update.message) {
      recentMessages.add(ctx.update.message)

      const { text, message_id } = ctx.update.message;
      const fromId = ctx.update.message.from.id;

      const totem = await totemGetByTgUserId(fromId);

      if (totem) {
        logger.info(
          'User with id = %s has totem, skipping. text = "%s"',
          fromId,
          text,
        );

        // Do nothing
      } else {
        {
          const label = fastCache.get({ text })

          if (label) {
            logger.info('Message "%s" fast-classified as "%s"', text, label)

            if (label === 'spam') {
              await ctx.deleteMessage(message_id)
            } else if (label === 'ham') {
              // DO NOTHING
            }

            return
          }
        }

        {
          const { value: category, confidence } = await ownModel.predict({
            text,
          });

          fastCache.add({ text, label: category })

          logger.info(
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

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
