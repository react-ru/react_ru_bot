import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.createTable("totems", (table) => {
    table.increments("id");

    table.integer("tgUserId");

    table.index("tgUserId");
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.dropTable("totems");
