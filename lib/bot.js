const Telegraf = require("telegraf");

exports.bot = new Telegraf(process.env.BOT_TOKEN);
