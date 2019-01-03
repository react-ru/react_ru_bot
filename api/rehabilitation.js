const mongoose = require('mongoose')
const { Rehabilitation } = require('../lib/models/Rehabilitation')

exports.createRehabilitation = async function (req, res) {
  const { chat_id, username, email, text } = req.body

  const rehabilitation = new Rehabilitation({
    chat_id,
    username,
    email,
    text,
    state: 'init'
  })

  rehabilitation.save()

  res.json(rehabilitation)
}

exports.getRehabilitations = async function (req, res) {
  const { chat_id } = req.query
  const rehabilitations = await Rehabilitation.find({
    chat_id
  })

  res.json(rehabilitations)
}

exports.approve = async function(req, res) {
  const { _id } = req.body
  
  const rehabilitation = await Rehabilitation.findOne({
    _id: mongoose.Types.ObjectId.createFromHexString(_id)
  })

  if (rehabilitation) {
    await rehabilitation.approve()
    res.json(rehabilitation)
  } else {
    res.status(404)
  }
}

exports.reject = async function(req, res) {
  const { _id } = req.body
  
  const rehabilitation = await Rehabilitation.findOne({
    _id: mongoose.Types.ObjectId.createFromHexString(_id)
  })

  if (rehabilitation) {
    await rehabilitation.reject()
    res.json(rehabilitation)
  } else {
    res.status(404)
  }
}
