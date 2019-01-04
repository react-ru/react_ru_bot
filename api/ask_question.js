exports.ask_question = async function (req, res) {
  const { chat_id, text } = req.body
  const messageFactory = req.app.get('messageFactory')
  const fullText = [
    '*С сайта поступил новый вопрос:*',
    text
  ].join('\n')
  const message = messageFactory.createNew({
    chat_id,
    text: fullText,
    parse_mode: 'Markdown'
  })
  await message.send()
  res.json(message)
}
