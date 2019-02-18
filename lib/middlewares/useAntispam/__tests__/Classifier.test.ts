import { describe, it, expect } from 'vitest'
import { PorterStemmerRu } from 'natural'
import { getAllExamples } from '../../../repositories/examples'
import { Classifier } from '../Classifier'

describe('useAntispam()', () => {
  describe('Classifier()', () => {
    it('should be properly trained', async () => {
      const c = new Classifier(PorterStemmerRu, 0.2)

      await c.pretrain()

      const examples = await getAllExamples()

      let [tp, tn, fp, fn] = Array(4).fill(0)

      for (const { text, label } of examples) {
        const { label: predictedLabel, confidence } = c.predict(text)

        if (confidence < 0.7) {
          console.table({
            text: text.substring(0, 24),
            predictedLabel,
            label,
            confidence
          })
        }

        if (label === predictedLabel && label === 'spam') { tp += 1 }
        if (label === predictedLabel && label === 'ham') { tn += 1 }
        if (label !== predictedLabel && label === 'spam') { fp += 1 }
        if (label !== predictedLabel && label === 'ham') { fn += 1 }
      }

      console.table({
        'true positive (spam is spam)': tp,
        'true negative (not spam is not spam)': tn,
        'false positive (spam is not spam)': fp,
        'false negative (not spam is spam)': fn,
        'accuracy': (tp + tn) / (tp + tn + fp + fn),
        'recall': tp / (tp + fn),
        'precision': tp / (tp + fp)
      })
    })
  })
})
