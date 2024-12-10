import { knex } from "./knex";
import type { BlackMark } from "./types";

export const assignToTgUserId = async (tgUserId: number) => {
  let blackMark = await knex
    .select<BlackMark[]>('*')
    .from('blackMarks')
    .where('tgUserId', tgUserId)
    .first()

  if (blackMark == null) {
    blackMark = {
      id: undefined,
      tgUserId,
      assignedTimes: 1,
      createdAt: new Date().getTime(),
      updatedAt: null
    }

    await knex
      .insert(blackMark)
      .into('blackMarks')
  } else {
    await knex('blackMarks')
      .update({
        assignedTimes: blackMark.assignedTimes + 1,
        updatedAt: new Date().getTime()
      })
      .where('id', blackMark.id)
  }
}

export const getAssignedTimesByTgUserId = async (tgUserId: number) => {
  const result = await knex
    .select<Pick<BlackMark, 'assignedTimes'>[]>('assignedTimes')
    .from('blackMarks')
    .where('tgUserId', tgUserId)
    .first()

  if (result == null)
    return 0

  return result.assignedTimes
}
