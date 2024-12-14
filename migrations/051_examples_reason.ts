import { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("examples", (table) => {
    table.enum('reason', ['classifier', 'duplicate', 'totem', 'cas']).defaultTo(null)
  });

export const down = async (knex: Knex): Promise<void> =>
  knex.schema.alterTable("examples", table => {
    table.dropColumn('reason')
  });
