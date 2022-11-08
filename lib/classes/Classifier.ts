import { LogisticRegressionClassifier, PorterStemmerRu, type Stemmer } from 'natural'
import type { Logger } from 'pino'

export abstract class Classifier {
  readonly _classifier: LogisticRegressionClassifier
  abstract readonly _logger: Logger

  abstract pretrain(): Promise<void>

  constructor(stemmer: Stemmer = PorterStemmerRu) {
    this._classifier = Reflect.construct(LogisticRegressionClassifier, [stemmer])
  }

  predict(example: string) {
    const classifications = this._classifier.getClassifications(example)

    if (classifications.length === 2) {
      const first = classifications[0]
      const last = classifications[classifications.length - 1]
      const label = first.label
      const confidence = 1 - last.value / first.value

      this._logger.trace({
        type: 'classifier-predicted',
        classifications,
        label,
        confidence
      })

      return {
        label: first.label,
        confidence: 1 - last.value / first.value
      }
    }

    this._logger.trace({
      type: 'classifier-failed-to-predict',
      example,
      classifications
    })

    return {
      label: 'unknown',
      confidence: 0,
    }
  }

  async train(text: string, label: string) {
    this._classifier.addDocument(text, label)
    this._classifier.train()

    this._logger.info({
      type: 'classifier-trained',
      text,
      label
    })
  }
}
