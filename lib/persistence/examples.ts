import { knex } from './knex'
import { User } from "telegraf/typings/core/types/typegram";
import { Example } from './types';

export const exampleCreate = async (messageId: number, from: User, text: string): Promise<number> => {
  const [{ id }] = await knex
    .insert({
      tgUserId: from.id,
      messageId,
      username: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
      languageCode: from.language_code ?? null,
      isPremium: from.is_premium ? true : false,
      link: from.username ? `https://t.me/${from.username}` : null,
      text,
      classifier: null,
      label: null,
      confidence: null,
      createdAt: new Date().getTime(),
      updatedAt: null
    })
    .into('examples')
    .returning('id')

  return id
}

export const exampleGetByMessageId = async (messageId: number) => {
  return knex
    .select<Example[]>('*')
    .from('examples')
    .where('messageId', messageId)
    .first()
}

export const exampleUpdate = async (id: number, { classifier, label, confidence, reason }: Pick<Example, 'classifier' | 'label' | 'confidence' | 'reason'>) => {
  await knex('examples')
    .update({
      classifier,
      label,
      confidence,
      reason,
      updatedAt: new Date().getTime()
    })
    .where('id', id)
}
