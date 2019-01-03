const { User } = require('./models/User')

exports.findUserByUsername = async function findUserByUsername(username) {
  const user = await User.findOne({
    username
  })
  return user
}
