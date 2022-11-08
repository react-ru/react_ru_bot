import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('totems', (table) => {
      table.increments('id')
      table.integer('user_id')
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('totems')
}

