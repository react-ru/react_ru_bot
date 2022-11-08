import { knex } from './knex'

declare module 'knex/types/tables' {
  type Totem = {
    id: number
    user_id: number
  }

  interface Tables {
    totems: Totem
  }
}

type Totem = import('knex/types/tables').Totem

export const createTotem = async (data: Omit<Totem, 'id'>) => knex('totems').insert(data)

export const getTotemByUserId = async (user_id: Totem['user_id']) => knex('totems').where({ user_id }).first()
