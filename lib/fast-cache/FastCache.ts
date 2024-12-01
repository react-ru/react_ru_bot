import type { LabeledExample, Labels, UnlabeledExample } from "../titorelli";

export class FastCache {
  private index: Record<string, Labels> = {}
  private examples: LabeledExample[] = []

  constructor(private maxStoredExamples: number) { }

  getLabel(example: UnlabeledExample) {
    if (this.examples.length === 0) return undefined

    return this.index[example.text]
  }

  save(example: LabeledExample) {
    if (this.examples.length >= this.maxStoredExamples) {
      const [exampleToRemove] = this.examples.splice(0, 1)

      delete this.index[exampleToRemove.text]
    }

    this.examples.push(example)
    this.index[example.text] = example.label
  }
}
