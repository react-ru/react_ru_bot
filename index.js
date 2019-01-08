const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Rehabilitation } = require("./lib/models/Rehabilitation");
const { createSync } = require("./middleware/sync");
const { api } = require("./api");
const { messageFactory } = require("./lib/messageFactory");
const { chatFactory } = require("./lib/chatFactory");
const { userFactory } = require("./lib/userFactory");
const { bot } = require("./lib/bot");

mongoose.connect(process.env.MONGODB_URI);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL
  }
});

Rehabilitation.setTelegram(bot.telegram);
Rehabilitation.setNodemailer(transporter);

const app = express();

app.enable("trust proxy");

app.set("telegram", bot.telegram);
app.set("messageFactory", messageFactory);

app.use("/api", cors(), api);

bot.on(
  "message",
  createSync({
    messageFactory,
    chatFactory,
    userFactory
  })
);

bot.startPolling();
app.listen(process.env.PORT);
