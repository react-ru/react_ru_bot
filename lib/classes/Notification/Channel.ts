import { Notification } from "./Notification"

export abstract class Channel<N extends Notification = Notification> {
  abstract send(notification: N): Promise<void>
}
