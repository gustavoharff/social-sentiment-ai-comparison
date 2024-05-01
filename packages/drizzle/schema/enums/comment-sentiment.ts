import { pgEnum } from 'drizzle-orm/pg-core'

export const commentSentimentEnum = pgEnum('comments_sentiment', [
  'positive',
  'negative',
  'neutral',
  'mixed',
])
