const { Message } = require("../lib/models/Message");

exports.latest_messages = async function(req, res) {
  const { chat_id, latest } = req.query;
  const messages = await Message.find(
    {
      "chat.id": Number(chat_id)
    },
    null,
    {
      limit: Number(latest),
      sort: {
        date: -1
      }
    }
  );
  res.json(messages);
};
