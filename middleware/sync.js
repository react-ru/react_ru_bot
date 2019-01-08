exports.createSync = function createSync({
  messageFactory,
  userFactory,
  chatFactory
}) {
  return async function sync(ctx, next) {
    const message = await messageFactory.fromContext(ctx);
    const user = await userFactory.fromContext(ctx);
    const chat = await chatFactory.fromContext(ctx);
    await message.save();
    await user.save();
    await chat.save();
    next();
  };
};
