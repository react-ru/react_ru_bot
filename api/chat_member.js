exports.chat_member = async function (req, res) {
  const telegram = req.app.get('telegram')
  const { chat_id, user_id } = req.query
  const chatMember = await telegram.getChatMember(chat_id, user_id)
  const profile_photos = await telegram.getUserProfilePhotos(user_id)
  res.json({
    ...chatMember,
    profile_photos
  })
}
