import { Telegraf } from "telegraf";
import pino from "pino";
import { titorelli } from "./lib";
import { totemCreate, totemGetByTgUserId } from "./lib/persistence";

const bot = new Telegraf(process.env["BOT_TOKEN"]!);
const logger = pino();

bot.use(async (ctx) => {
  if ("message" in ctx.update) {
    if ("text" in ctx.update.message) {
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
        const { value: category, confidence } = await titorelli.predict({
          text,
        });

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

      return;
    }
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
