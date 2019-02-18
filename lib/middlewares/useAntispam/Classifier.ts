import { Classifier as ClassifierBase } from '../../classes/Classifier'
import { getAllExamples } from '../../repositories/examples'

export class Classifier extends ClassifierBase {
  async pretrain() {
    const examples = await getAllExamples()

    for (const { text, label } of examples) {
      this.classifier.addDocument(text, label)
    }

    this.classifier.train()
  }
}
