import type { Knex } from 'knex'
import { readFile } from 'node:fs/promises'

export async function seed(knex: Knex) {
  await knex('examples').where({ label: 'spam' }).del()

  const spamText = await readFile('data/spam.txt', 'utf-8')
  const spam = spamText.split('---').map(text => text.trim())

  await knex.transaction(async t => {
    for (const text of spam) {
      await t.insert({ text, label: 'spam' }).into('examples')
    }
  })
}
