import { BayesClassifier, PorterStemmerRu, type Stemmer } from 'natural'

export abstract class Classifier {
  private readonly _classifier: BayesClassifier

  abstract pretrain(): Promise<void>

  constructor(stemmer: Stemmer = PorterStemmerRu, smoothing: number = 0.2) {
    this._classifier = Reflect.construct(BayesClassifier, [stemmer, smoothing]) // new BayesClassifier(stemmer, smoothing)
  }

  predict(example: string) {
    const classifications = this._classifier.getClassifications(example)

    if (classifications.length === 2) {
      const first = classifications[0]
      const last = classifications[classifications.length - 1]

      return {
        label: first.label,
        confidence: 1 - last.value / first.value
      }
    }

    return {
      label: 'unknown',
      confidence: 0,
    }
  }

  async train(text: string, label: string) {
    this._classifier.addDocument(text, label)
    this._classifier.train()
  }

  protected get classifier() {
    return this._classifier
  }
}
