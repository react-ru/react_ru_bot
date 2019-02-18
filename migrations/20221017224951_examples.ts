import type { Knex } from 'knex'

export async function up(knex: Knex) {
  return knex.schema
    .createTable('examples', (table) => {
      table.increments('id')
      table.text('text').notNullable()
      table.string('label').notNullable()
    })
}

export async function down(knex: Knex) {
  return knex.schema
    .dropTable('examples')
}
