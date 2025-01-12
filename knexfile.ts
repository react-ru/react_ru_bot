import path from "node:path";
import { type Knex } from "knex";
import { mkdirSync } from "node:fs";

export default {
  client: "sqlite3",
  connection: {
    filename: path.resolve(__dirname, "data/db.sqlite3"),
  },
  useNullAsDefault: true
} satisfies Knex.Config;
