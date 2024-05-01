import { pgEnum } from 'drizzle-orm/pg-core'

export const sentimentProviderEnum = pgEnum('sentiments_providers', [
  'aws',
  'google',
  'azure',
])
