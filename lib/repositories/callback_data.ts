import { User } from 'telegraf/types'
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

export type CallbackDataJSON = {
  orig_message_id: number,
  orig_message_text: string,
  orig_message_from: User,
  text_label: 'spam' | 'ham',
  ensure_spam_message_id?: number
}

export const createCallbackData = async <D extends CallbackDataJSON>(
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

export const getCallbackDataById = async <D extends CallbackDataJSON>(
  id: CallbackData['id']
) => {
  const { json } = (await knex('callback_data').where({ id }).first('json'))!

  return JSON.parse(json) as D
}

export const updateCallbackDataById = async <D extends CallbackDataJSON>(
  id: number,
  partialData: Partial<D>
) => {
  const data = await getCallbackDataById(id)
  Object.assign(data, partialData, { id })

  await knex('callback_data').where({ id }).update('json', data)
}
