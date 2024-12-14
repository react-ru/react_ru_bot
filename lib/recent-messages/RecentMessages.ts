import { Logger } from "pino";
import { exampleGetByMessageId } from "../persistence";
import { differenceInMinutes } from "date-fns";

export class RecentMessagesStore {
  constructor(
    private maxCount: number,
    private logger: Logger
  ) { }

  add(message: never) { }

  async findById(messageId: number) {
    const message = await exampleGetByMessageId(messageId)

    if (message.createdAt == null)
      return null

    const now = new Date()
    const createdAtDate = new Date(message.createdAt)
    const diffM = differenceInMinutes(now, createdAtDate)

    this.logger.info('RecentMessages#findById(%s): older than 20 minutes', messageId)

    if (diffM <= 20) {
      return message
    }

    return null
  }
}
