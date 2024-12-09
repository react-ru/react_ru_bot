import type { Logger } from "pino"

export class SpamLockService {
  private locks = new Set<number>()

  constructor(
    private lockDurationMs,
    private logger: Logger
  ) { }

  lock(tgUserId: number) {
    this.locks.add(tgUserId)

    this.logger.info('Lock added for %sms for user id = %s', this.lockDurationMs / 1000, tgUserId)

    setTimeout(() => {
      this.logger.info('Lock removed for user id = %s', tgUserId)

      this.locks.delete(tgUserId)
    }, this.lockDurationMs)
  }

  locked(tgUserId: number) {
    return this.locks.has(tgUserId)
  }
}
