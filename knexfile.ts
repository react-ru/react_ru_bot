import path from "node:path";
import { type Knex } from "knex";

export default {
  client: "sqlite3",
  connection: {
    filename: path.resolve(__dirname, "data/db.sqlite3"),
  },
} satisfies Knex.Config;
