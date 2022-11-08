import { logger as parentLogger } from '../../pino'
import { getTotemByUserId } from '../../repositories'
import type { Middleware, Context } from 'telegraf'

const logger = parentLogger.child({ name: 'useTotem' })

export const useTotem = (): Middleware<Context> => {
  return async (ctx) => {
    if ('message' in ctx.update) {
      const { from } = ctx.update.message

      const totem = await getTotemByUserId(from.id)

      if (totem) {
        Reflect.set(ctx, 'author_has_totem', true)
      }
    }
  }
}
