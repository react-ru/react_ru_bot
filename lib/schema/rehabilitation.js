const mongoose = require('mongoose')
const { findUserByUsername } = require('../findUserByUsername')

let TELEGRAM_CLIENT
let NODEMAILER_TRANSPORT
const STATE_INIT = 'init'
const STATE_APPROVED = 'approved'
const STATE_REJECTED = 'rejected'

const rehabilitation = exports.rehabilitation = new mongoose.Schema({
  chat_id: Number,
  username: String,
  email: String,
  text: String,
  state: {
    type: String,
    enum: [STATE_INIT, STATE_APPROVED, STATE_REJECTED]
  }
})

rehabilitation.statics.setTelegram = function setTelegram(telegram) {
  TELEGRAM_CLIENT = telegram
}

rehabilitation.statics.setNodemailer = function setNodemailer(nodemailer) {
  NODEMAILER_TRANSPORT = nodemailer
}

rehabilitation.methods.getTelegram = function getTelegram() {
  return TELEGRAM_CLIENT
}

rehabilitation.methods.getNodemailer = function getNodemailer() {
  return NODEMAILER_TRANSPORT
}

rehabilitation.methods.approve = async function approve() {
  await this.unbanChatMember()
  await this.sendEmailApproved()
  this.state = STATE_APPROVED
  await this.save()
}

rehabilitation.methods.unbanChatMember = async function unbanChatMember() {
  const telegram = this.getTelegram()
  const user = await findUserByUsername(this.username)
  await telegram.unbanChatMember(this.chat_id, user.id)
}

rehabilitation.methods.sendEmailApproved = async function sendEmailApproved() {
  const { title } = await this.getChat()
  await this.sendEmail('Вы разбанены', `Здравствуйте. Сообщаем, что вы РАЗБАНЕНЫ в группе ${title}.`)
}

rehabilitation.methods.reject = async function reject() {
  await this.sendEmailRejected()
  this.state = STATE_REJECTED
  await this.save()
}

rehabilitation.methods.sendEmailRejected = async function sendEmailRejected() {
  const { title } = await this.getChat()
  await this.sendEmail('Вы НЕ разбанены', `Здравствуйте. Сообщаем, что вы НЕ разбанены в группе ${title}.`)
}

rehabilitation.methods.sendEmail = async function sendEmail(subject, text) {
  const nodemailer = this.getNodemailer()
  await new Promise((resolve, reject) => {
    const emailOptions = {
      from: '"ychebotaev" <yury.79120345101@gmail.com>',
      to: this.email,
      subject,
      text
    }
    nodemailer.sendMail(emailOptions, (error, info) => {
      if (error) {
        reject(error)
      } else {
        resolve(info)
      }
    })
  })
}

rehabilitation.methods.getChat = async function getChat() {
  const telegram = this.getTelegram()
  return telegram.getChat(this.chat_id)
}
