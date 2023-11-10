import type { LabeledExample } from './types'

export const train = async ({ text, label }: LabeledExample) => {
  const url = new URL('/react_ru/train', process.env['TITORELLI_HOST'])
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      label
    })
  })
}
