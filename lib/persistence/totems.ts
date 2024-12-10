import { knex } from "./knex";
import type { Totem } from "./types";

export const totemCreate = async (tgUserId: number) => {
  const [{ id }] = await knex
    .insert({
      tgUserId,
      createdAt: new Date().getTime()
    })
    .into("totems")
    .returning("id");

  return id;
};

export const totemGetByTgUserId = async (tgUserId: number) => {
  return knex
    .select<Totem[]>("*")
    .from("totems")
    .where("tgUserId", tgUserId)
    .first();
};

export const totemDeleteByTgUserId = async (tgUserId: number) => {
  return knex
    .delete()
    .from('totems')
    .where('tgUserId', tgUserId)
}
