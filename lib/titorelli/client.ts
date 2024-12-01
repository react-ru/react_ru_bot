import { createClient } from '@titorelli/client'

export const client = createClient({
  serviceUrl: process.env.TITORELLI_HOST,
  clientId: 'react_ru_bot',
  clientSecret: process.env.TITORELLI_OAUTH_CLIENT_SECRET,
  scope: 'predict'
})
