import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("totems", (table) => {
    table.bigInteger("createdAt");
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable('totems', (table) => {
    table.dropColumn('createdAt')
  })
