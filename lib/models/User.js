const mongoose = require('mongoose')
const { user } = require('../schema/user')

exports.User = mongoose.model('User', user)
