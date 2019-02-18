import { Classifier } from './Classifier'
import { EnsureSpamMessage } from './messages/EnsureSpamMessage'
import { sendNotification, notifications } from '../../notifications'
import type { Middleware, Context } from 'telegraf'
import { createCallbackData, getCallbackDataById, updateCallbackDataById } from '../../repositories'

export const useAntispam = (): Middleware<Context> => {
  const classifier = new Classifier()

  const classifierReady = classifier.pretrain()

  return async (ctx) => {
    await classifierReady

    if ('message' in ctx.update) {
      if ('text' in ctx.update.message) {
        const { text, message_id, from } = ctx.update.message
        const { label, confidence } = classifier.predict(text)

        if (label === 'spam') {
          if (confidence < 0.7) {
            const spamCallbackDataId = await createCallbackData({
              orig_message_id: message_id,
              orig_message_from: from,
              orig_message_text: text,
              text_label: 'spam',
            })
            const hamCallbackDataId = await createCallbackData({
              orig_message_id: message_id,
              orig_message_text: text,
              orig_message_from: from,
              text_label: 'ham'
            })

            const ensureSpamMessage = new EnsureSpamMessage({
              text,
              spamCallbackData: spamCallbackDataId.toString(),
              hamCallbackData: hamCallbackDataId.toString()
            })

            const { message_id: ensure_spam_message_id } = await ctx.reply.apply(ctx, <any>ensureSpamMessage.toReplyArgs())

            await updateCallbackDataById(spamCallbackDataId, { ensure_spam_message_id })
            await updateCallbackDataById(hamCallbackDataId, { ensure_spam_message_id })
          } else {
            const isDeleted = await ctx.deleteMessage(message_id)

            if (isDeleted) {
              await sendNotification(new notifications.SpamDeleted({
                text,
                author: from,
              }))
            }
          }
        }
      }
    } else
      if ('callback_query' in ctx.update) {
        const { data } = ctx.update.callback_query
        const { orig_message_id, orig_message_text, text_label, orig_message_from, ensure_spam_message_id } = await getCallbackDataById(Number(data))

        await ctx.deleteMessage(ensure_spam_message_id!)

        classifier.train(orig_message_text, text_label)

        if (text_label === 'spam') {
          const isDeleted = await ctx.deleteMessage(orig_message_id)

          if (isDeleted) {
            await sendNotification(new notifications.SpamDeleted({
              text: orig_message_text,
              author: orig_message_from,
            }))
          }
        }
      }
  }
}
