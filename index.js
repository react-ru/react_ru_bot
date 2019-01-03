const Telegraf = require('telegraf')
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const { MessageFactory } = require('./lib/classes/MessageFactory')
const { ChatFactory } = require('./lib/classes/ChatFactory')
const { UserFactory } = require('./lib/classes/UserFactory')
const { Rehabilitation } = require('./lib/models/Rehabilitation')
const { createSync } = require('./middleware/sync')
const { api } = require('./api')

mongoose.connect(
  process.env.MONGODB_URI
)

const bot = new Telegraf(process.env.BOT_TOKEN)

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL
  }
});

Rehabilitation.setTelegram(bot.telegram)
Rehabilitation.setNodemailer(transporter)

const app = express()
app.set('telegram', bot.telegram)

app.use('/api', cors(), api)

bot.on('message', createSync({
  messageFactory: new MessageFactory({
    bot
  }),
  chatFactory: new ChatFactory({
    bot
  }),
  userFactory: new UserFactory({
    bot
  }),
  handler({ message, chat, user }, ctx) {
    
  }
}))

bot.startPolling()
app.listen(3000)
