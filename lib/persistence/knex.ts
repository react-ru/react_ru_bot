import createKnex from "knex";
import config from "../../knexfile";

export const knex = createKnex({
  ...config,
  useNullAsDefault: true,
});
