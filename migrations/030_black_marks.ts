import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.createTable("blackMarks", (table) => {
    table.increments("id");

    table.integer("tgUserId");
    table.integer('assignedTimes')
    table.integer('createdAt')
    table.integer('updatedAt').defaultTo(null)

    table.index("tgUserId");
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.dropTable("blackMarks");
