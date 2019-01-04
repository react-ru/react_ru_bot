const mongoose = require('mongoose')

let TELEGRAM_CLIENT

const message = exports.message = new mongoose.Schema({
  message_id: Number,
  chat_id: Number, // Extra
  parse_mode: { // Extra
    type: 'string',
    enum: ['Markdown', 'HTML']
  },
  disable_web_page_preview: Boolean, // Extra,
  disable_notification: Boolean, // Extra
  reply_to_message_id: Number, // Extra
  state: {
    type: 'string',
    enum: ['init', 'sended'],
    default: 'init'
  },
  from: Object,
  date: Number,
  chat: Object,
  forward_from: Object,
  forward_from_chat: Object,
  forward_from_message_id: Number,
  forward_signature: String,
  forward_date: Number,
  reply_to_message: Object,
  edit_date: Number,
  media_group_id: String,
  author_signature: String,
  text: String,
  entities: [Object],
  caption_entities: [Object],
  audio: Object,
  document: Object,
  animation: Object,
  game: Object,
  photo: [Object],
  sticker: Object,
  video: Object,
  voice: Object,
  video_note: Object,
  caption: String,
  contact: Object,
  location: Object,
  venue: Object,
  new_chat_members: [Object],
  left_chat_member: Object,
  new_chat_title: String,
  new_chat_photo: Object,
  delete_chat_photo: Boolean,
  group_chat_created: Boolean,
  supergroup_chat_created: Boolean,
  channel_chat_created: Boolean,
  migrate_to_chat_id: Number,
  migrate_from_chat_id: Number,
  pinned_message: Object,
  invoice: Object,
  successful_payment: Object,
  connected_website: String,
  passport_data: Object,
})

message.statics.setTelegram = function setTelegram (telegram) {
  TELEGRAM_CLIENT = telegram
}

message.methods.getTelegram = function getTelegram() {
  return TELEGRAM_CLIENT
}

message.methods.send = async function send() {
  const telegram = this.getTelegram()
  const result = await telegram.sendMessage(this.chat_id, this.text, {
    parse_mode: this.parse_mode,
    disable_web_page_preview: this.disable_web_page_preview,
    disable_notification: this.disable_notification,
    reply_to_message_id: this.reply_to_message_id
  })
  this.state = 'sended'
  await this.save()
  return result
}
