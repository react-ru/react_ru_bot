import type { LabeledExample, Labels, UnlabeledExample } from "@titorelli/client"

export class FastCache {
  private index: Record<string, Labels> = {}

  constructor(
    private maxStoredExamples: number,
    private minDistance: number
  ) { }

  get(example: UnlabeledExample) {
    if (this.size() === 0) return undefined

    return this.index[example.text]
  }

  add(example: LabeledExample) {
    if (this.size() >= this.maxStoredExamples) {
      const keys = Object.keys(this.index)

      const [keyToRemove] = keys.splice(0, 1)

      delete this.index[keyToRemove]
    }

    this.index[example.text] = example.label
  }

  private size() {
    return Object.keys(this.index).length
  }
}
