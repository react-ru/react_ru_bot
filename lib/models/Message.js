const mongoose = require('mongoose')
const { message } = require('../schema/message')

exports.Message = mongoose.model('Message', message)
