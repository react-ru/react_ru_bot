import { Logger } from "pino";
import { exampleGetByMessageId } from "../persistence";

export class RecentMessagesStore {
  constructor(
    private maxCount: number,
    private logger: Logger
  ) { }

  add(message: never) { }

  async findById(messageId: number) {
    const message = await exampleGetByMessageId(messageId)

    console.log('message =', message)

    return message
  }
}
