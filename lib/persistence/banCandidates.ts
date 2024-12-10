import { User } from "telegraf/typings/core/types/typegram";
import { knex } from "./knex";
import type { BanCandidate } from "./types";

export const banCandidateCreate = async (user: User) => {
  const old = await knex
    .select<Pick<BanCandidate, 'tgUserId'>[]>('tgUserId')
    .from('banCandidates')
    .where('tgUserId', user.id)
    .first()

  if (old)
    return

  await knex
    .insert({
      tgUserId: user.id,
      username: user.username ?? null,
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      languageCode: user.language_code ?? null,
      isPremium: user.is_premium ? true : false,
      link: user.username ? `https://t.me/${user.username}` : null,
      createdAt: new Date().getTime()
    } as Omit<BanCandidate, 'id'>)
    .into('banCandidates')
}
