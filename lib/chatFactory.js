const { ChatFactory } = require("./classes/ChatFactory");
const { bot } = require("./bot");

exports.chatFactory = new ChatFactory({
  bot
});
