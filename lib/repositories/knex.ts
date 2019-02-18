import { knex as createKnex } from 'knex'

// TODO: Reuse data from knexfile
export const knex = createKnex({
  client: 'sqlite3',
  connection: {
    filename: 'data/db.sqlite3'
  }
})
