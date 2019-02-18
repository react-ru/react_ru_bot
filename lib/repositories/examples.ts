import { knex } from './knex'

declare module 'knex/types/tables' {
  type Example = {
    id: number
    text: string
    label: string
  }

  interface Tables {
    examples: Example
  }
}

type Example = import('knex/types/tables').Example

export const getAllExamples = () => knex('examples').table('examples').select()

export const createExample = async (
  data: Omit<Example, 'id'>
) => knex('examples').insert(data)
