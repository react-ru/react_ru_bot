import { createClient } from '@titorelli/client'

export const client = createClient({
  serviceUrl: process.env.TITORELLI_HOST,
  clientId: process.env.TITORELLI_CLIENT_ID,
  clientSecret: process.env.TITORELLI_OAUTH_CLIENT_SECRET,
  modelId: process.env.TITORELLI_CLIENT_MODEL_ID,
  scope: ['predict', 'train', 'exact_match/train', 'totems/train', 'cas/predict', 'cas/train'] as any
})
