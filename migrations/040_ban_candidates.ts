import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.createTable("banCandidates", (table) => {
    table.increments("id");

    table.integer("tgUserId");
    table.string('username').defaultTo(null)
    table.string('firstName').defaultTo(null)
    table.string('lastName').defaultTo(null)
    table.string('languageCode').defaultTo(null)
    table.boolean('isPremium').defaultTo(null)
    table.string('link').defaultTo(null)
    table.integer('createdAt')

    table.index("tgUserId");
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.dropTable("banCandidates");
