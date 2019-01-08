const { Chat } = require("../lib/models/Chat");

exports.members_count = async function(req, res) {
  const { chat_id } = req.query;
  const chat = await Chat.findOne({ id: chat_id });
  if (chat) {
    const { members_count } = chat;
    res.json({
      chat_id,
      members_count
    });
  } else {
    res.status(404).end();
  }
};
