require('dotenv').config()

export default {
  client: 'sqlite3',
  connection: { filename: process.env['DATABASE_URL'] ?? 'data/db.sqlite3' }
}
