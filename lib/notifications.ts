export { notifications, channels } from './classes/Notification'
import type { Notification, Channel } from './classes/Notification'

const CHANNELS: Channel<Notification>[] = []

export const sendNotification = <N extends Notification>(notification: N) =>
  Promise.all(CHANNELS.map(channel => channel.send(notification)))

export const registerChannel = <C extends Channel<Notification>>(channel: C) =>
  CHANNELS.push(channel)
