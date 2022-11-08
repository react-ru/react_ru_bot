import { logger as parentLogger } from '../../pino'
import { Classifier } from './Classifier'
import { createCallbackData, getCallbackDataById, updateCallbackDataById, createTotem } from '../../repositories'
import type { CallbackDataJSON } from './types'
import type { Middleware, Context } from 'telegraf'

const logger = parentLogger.child({ name: 'useAntispam' })

export const useAntispam = (): Middleware<Context> => {
  const classifier = new Classifier()

  const classifierReady = classifier.pretrain()

  return async (ctx) => {
    await classifierReady

    const isAuthorHasTotem: boolean = Reflect.get(ctx, 'author_has_totem') ?? false

    if (isAuthorHasTotem) return // Skip spam check

    if ('message' in ctx.update) {
      if ('text' in ctx.update.message) {
        const { text, message_id, from } = ctx.update.message
        const { label, confidence } = classifier.predict(text)

        logger.info({
          text,
          label,
          confidence,
          message_id,
          from
        })

        if (label === 'spam') {
          if (confidence < 0.5) {
            const spamCallbackDataId = await createCallbackData<CallbackDataJSON>({
              orig_message_id: message_id,
              orig_message_from: from,
              orig_message_text: text,
              text_label: 'spam',
            })
            const hamCallbackDataId = await createCallbackData<CallbackDataJSON>({
              orig_message_id: message_id,
              orig_message_text: text,
              orig_message_from: from,
              text_label: 'ham'
            })

            const { message_id: ensure_spam_message_id } = await ctx.reply(
              'Это спам?',
              {
                reply_to_message_id: message_id,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Да, это спам',
                        callback_data: spamCallbackDataId.toString()
                      },
                      {
                        text: 'Нет, это не спам',
                        callback_data: hamCallbackDataId.toString()
                      }
                    ]
                  ]
                }
              }
            )

            await updateCallbackDataById<CallbackDataJSON>(spamCallbackDataId, { ensure_spam_message_id })
            await updateCallbackDataById<CallbackDataJSON>(hamCallbackDataId, { ensure_spam_message_id })
          } else {
            const isDeleted = await ctx.deleteMessage(message_id)

            if (isDeleted) {
              logger.info({
                type: 'spam-deleted',
                text: text,
                author: from
              })
            }
          }
        }
      }
    } else
      if ('callback_query' in ctx.update) {
        const { data } = ctx.update.callback_query
        const { orig_message_id, orig_message_text, text_label, orig_message_from, ensure_spam_message_id } = await getCallbackDataById<CallbackDataJSON>(Number(data))

        if (orig_message_from.id === ctx.update.callback_query.from.id) return // Spammers cannot vote for themselves

        await ctx.deleteMessage(ensure_spam_message_id!)

        classifier.train(orig_message_text, text_label)

        if (text_label === 'spam') {
          const isDeleted = await ctx.deleteMessage(orig_message_id)

          if (isDeleted) {
            logger.info({
              type: 'spam-deleted',
              text: orig_message_text,
              author: orig_message_from
            })
          }
        } else
          if (text_label === 'ham') {
            await createTotem({ user_id: orig_message_from.id })

            Reflect.set(ctx, 'author_has_totem', true)

            logger.info({
              type: 'totem-granted',
              receiver: orig_message_from
            })
          }
      }
  }
}
