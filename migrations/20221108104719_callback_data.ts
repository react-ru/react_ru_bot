import type { Knex } from 'knex'

export async function up(knex: Knex) {
  return knex.schema
    .createTable('callback_data', (table) => {
      table.increments('id')
      table.json('json')
    })
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable('callback_data')
}
