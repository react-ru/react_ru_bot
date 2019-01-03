const mongoose = require('mongoose')

const user = exports.user = new mongoose.Schema({
    id: Number,
    is_bot: Boolean,
    first_name: String,
    last_name: String,
    username: {
        type: String,
        index: true
    },
    language_code: String
})

user.statics.setTelegram = function setTelegram (telegram) {
  TELEGRAM_CLIENT = telegram
}

user.methods.getTelegram = function getTelegram() {
  return TELEGRAM_CLIENT
}
