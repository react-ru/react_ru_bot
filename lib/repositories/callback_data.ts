import { knex } from './knex'

declare module 'knex/types/tables' {
  type CallbackData = {
    id: number
    json: string
  }

  interface Tables {
    callback_data: CallbackData
  }
}

type CallbackData = import('knex/types/tables').CallbackData

export const createCallbackData = async <D extends object>(
  jsonOrData: string | D
) => {
  let json

  if (typeof jsonOrData === 'string') {
    json = jsonOrData
  } else
    if (typeof jsonOrData === 'object') {
      json = JSON.stringify(jsonOrData, null, 2)
    }

  const [id] = await knex('callback_data').insert({ json })

  return id
}

export const getCallbackDataById = async <D extends object>(
  id: CallbackData['id']
) => {
  const { json } = (await knex('callback_data').where({ id }).first('json'))!

  return JSON.parse(json) as D
}

export const updateCallbackDataById = async <D extends object>(
  id: number,
  partialData: Partial<D>
) => {
  const data = await getCallbackDataById(id)
  Object.assign(data, partialData, { id })

  await knex('callback_data').where({ id }).update('json', data)
}
