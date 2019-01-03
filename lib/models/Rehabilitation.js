const mongoose = require('mongoose')
const { rehabilitation } = require('../schema/rehabilitation')

exports.Rehabilitation = mongoose.model('Rehabilitation', rehabilitation)
