import { Logger } from "pino";
import type { Message } from "telegraf/typings/core/types/typegram";

export class RecentMessagesStore {
  private messages: Message[] = []

  constructor(
    private maxCount: number,
    private logger: Logger
  ) { }

  add(message: Message) {
    if (this.messages.length >= this.maxCount) {
      this.logger.info('messages exceed maxCount, removing first message from list')

      this.messages.splice(0, 1)
    }

    this.messages.push(message)

    this.logger.info('messages array now have length = %s', this.messages.length)
  }

  findById(messageId: number) {
    return this.messages.find(({ message_id }) => messageId === message_id)
  }
}
