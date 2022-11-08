import { LogisticRegressionClassifier } from 'natural'
import { Classifier as BaseClassifier } from '../../classes/Classifier'
import { getAllExamples } from '../../repositories/examples'
import { logger as parentLogger } from '../../pino'
import type { Logger } from 'pino'

export class Classifier extends BaseClassifier {
  declare readonly _classifier: LogisticRegressionClassifier
  declare readonly _logger: Logger

  constructor(...args: ConstructorParameters<typeof BaseClassifier>) {
    super(...args)

    this._logger = parentLogger.child({ name: 'useAntispam-classifier' })
  }

  async pretrain() {
    const examples = await getAllExamples()

    for (const { text, label } of examples) {
      this._classifier.addDocument(text, label)
    }

    this._classifier.train()
  }
}
