export class SpamLockService {
  private locks = new Set<number>()

  constructor(private lockDurationMs) { }

  lock(tgUserId: number) {
    this.locks.add(tgUserId)

    setTimeout(() => this.locks.delete(tgUserId), this.lockDurationMs)
  }

  locked(tgUserId: number) {
    return this.locks.has(tgUserId)
  }
}
