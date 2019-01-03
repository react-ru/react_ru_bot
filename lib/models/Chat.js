const mongoose = require('mongoose')
const { chat } = require('../schema/chat')

exports.Chat = mongoose.model('Chat', chat)
