const mongoose = require('mongoose')
const chatType = require('../constants/chatType')
const { values } = require('lodash')

let TELEGRAM_CLIENT

const chat = exports.chat = new mongoose.Schema({
  id: Number,
  type: {
      type: String,
      enum: values(chatType)
  },
  title: String,
  username: String,
  first_name: String,
  last_name: String,
  all_members_are_administrators: Boolean,
  photo: Object, // ChatPhoto
  description: String,
  invite_link: String,
  pinned_message: Object, // Message
  sticker_set_name: String,
  can_set_sticker_set: Boolean,
  members_count: Number,
})

chat.statics.setTelegram = function setTelegram (telegram) {
  TELEGRAM_CLIENT = telegram
}

chat.methods.getTelegram = function getTelegram() {
  return TELEGRAM_CLIENT
}
