const { UserFactory } = require("./classes/UserFactory");
const { bot } = require("./bot");

exports.userFactory = new UserFactory({
  bot
});
