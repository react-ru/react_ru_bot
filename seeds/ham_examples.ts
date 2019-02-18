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

// exports.seed = async knex => {
//   await knex('examples').where({ label: 'smooth' }).del()

//   // const recursivelyUnwrapText = ({ text }) => Array.isArray(text) ? text.map(recursivelyUnwrapText).join(' ') : text
//   /** @type string[] */
//   const ham = readJSONSync('data/result.json', 'utf-8')
//     .messages
//     .filter(({ type }) => type === 'message')
//     .flatMap(recursivelyUnwrapText)
//     .filter((_, index) => !(index % 1000)) // Each 1000th

//   await knex.transaction(async t => {
//     for (const text of ham) {
//       await t.insert({ text, label: 'smooth' }).into('examples')
//     }
//   })
// }
