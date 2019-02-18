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

// const fs = require('fs')

// const modelFilename = process.env['ANTISPAM_CLASSIFIER_FILENAME'] ?? 'data/antispam-classifier.json'

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> } 
//  */
// exports.seed = async knex => {
//   if (fs.existsSync(modelFilename)) fs.unlinkSync(modelFilename)
//   await knex('examples').where({ label: 'spam' }).del()

//   const spam = fs.readFileSync('data/spam.txt', 'utf-8').split('---').map(text => text.trim())

//   await knex.transaction(async t => {
//     for (const text of spam) {
//       await t.insert({ text, label: 'spam' }).into('examples')
//     }
//   })
// }
