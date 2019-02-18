import { Channel } from '../Channel'
import { Notification } from '../Notification'

export class Email extends Channel {
  async send(notification: Notification): Promise<void> {
    return 
  }
}
