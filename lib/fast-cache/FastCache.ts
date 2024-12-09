import { Logger } from "pino"
import type { LabeledExample, Labels, UnlabeledExample } from "@titorelli/client"

export class FastCache {
  private index: Record<string, Labels> = {}

  constructor(
    private maxStoredExamples: number,
    private minDistance: number,
    private logger: Logger
  ) { }

  get(example: UnlabeledExample) {
    if (this.size() === 0) return undefined

    return this.index[example.text]
  }

  add(example: LabeledExample) {
    if (this.size() >= this.maxStoredExamples) {
      this.logger.info('Size of the index exceed maxStoredExamples, removing first key')

      const keys = Object.keys(this.index)

      const [keyToRemove] = keys.splice(0, 1)

      delete this.index[keyToRemove]
    }

    this.logger.info('Addming example to FastCache label = %s, text = %s', example.label, example.text)

    this.index[example.text] = example.label
  }

  private size() {
    return Object.keys(this.index).length
  }
}
