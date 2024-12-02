import { Message, MessageEntity, Update } from "telegraf/typings/core/types/typegram";

export class RecentMessagesStore {
  private messages: Message[] = []

  constructor(private maxCount) { }

  add(message: Message) {
    this.messages.push(message)

    if (this.messages.length >= this.maxCount) {
      this.messages.splice(0, 1)
    }
  }

  findById(messageId: number) {
    return this.messages.find(({ message_id }) => messageId === message_id)
  }
}
