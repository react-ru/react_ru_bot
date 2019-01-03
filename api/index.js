const express = require('express')
const { wrap } = require('@awaitjs/express')
const { json } = require('body-parser')
const { members_count } = require('./members_count')
const { latest_messages } = require('./latest_messages')
const { chat_member } = require('./chat_member')
const { createRehabilitation, getRehabilitations, approve, reject } = require('./rehabilitation')

const api = exports.api = express.Router()

api.get('/members_count', wrap(members_count))
api.get('/latest_messages', wrap(latest_messages))
api.get('/chat_member', wrap(chat_member))

api.get('/rehabilitation', wrap(getRehabilitations))
api.post('/rehabilitation', json(), wrap(createRehabilitation))
api.post('/rehabilitation/approve', json(), wrap(approve))
api.post('/rehabilitation/reject', json(), wrap(reject))
