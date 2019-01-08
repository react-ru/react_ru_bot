const { MessageFactory } = require("./classes/MessageFactory");
const { bot } = require("./bot");

exports.messageFactory = new MessageFactory({
  bot
});
