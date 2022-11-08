import { knex as createKnex } from 'knex'
import config from '../../knexfile'

export const knex = createKnex(config)
