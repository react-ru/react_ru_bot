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
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");
const statusMonitor = require("express-status-monitor");
const helmet = require("helmet");

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

const mongoStore = new MongoStore({
  uri: process.env.MONGODB_URI
});

const limiter = rateLimit({
  store: mongoStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());

app.use(statusMonitor());

app.use("/api", cors(), limiter, api);

bot.on(
  "message",
  createSync({
    messageFactory,
    chatFactory,
    userFactory
  })
);

bot.on(
  [
    "message",
    "edited_message",
    "callback_query",
    "inline_query",
    "shipping_query",
    "pre_checkout_query",
    "chosen_inline_result",
    "channel_post",
    "edited_channel_post"
  ],
  function(ctx) {
    console.log(ctx);
  }
);

bot.startPolling();
app.listen(process.env.PORT);
