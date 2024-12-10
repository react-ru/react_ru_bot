import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.createTable("examples", (table) => {
    table.increments("id");

    table.integer("tgUserId");
    table.integer("messageId");
    table.string('username').defaultTo(null)
    table.string('firstName').defaultTo(null)
    table.string('lastName').defaultTo(null)
    table.string('languageCode').defaultTo(null)
    table.boolean('isPremium').defaultTo(null)
    table.string('link').defaultTo(null)
    table.text('text')
    table.enum('classifier', ['fast-classifier', 'titorelli', 'black-mark', 'totem']).defaultTo(null)
    table.enum('label', ['spam', 'ham']).defaultTo(null)
    table.float('confidence').defaultTo(null)
    table.integer('createdAt')
    table.integer('updatedAt').defaultTo(null)

    table.index("tgUserId");
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.dropTable("examples");
