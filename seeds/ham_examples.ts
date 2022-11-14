import type { Knex } from 'knex'
import { readJSONSync } from 'fs-extra'
import { telegram } from '../lib/utils'

export async function seed(knex: Knex) {
  await knex('examples').where({ label: 'ham' }).del()

  const ham = readJSONSync('data/result.json', 'utf-8')
    .messages
    .filter(({ type }: { type: string }) => type === 'message')
    .flatMap(telegram.recursivelyUnwrapText)
    .filter(({}, index: number) => !(index % 1000)) // Each 1000th

  await knex.transaction(async t => {
    for (const text of ham) {
      await t.insert({ text, label: 'ham' }).into('examples')
    }
  })
}
