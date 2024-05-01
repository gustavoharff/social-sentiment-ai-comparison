import { relations } from 'drizzle-orm'
import { pgTable, uuid } from 'drizzle-orm/pg-core'

import { comment } from './comment'
import { commentSentimentEnum } from './enums/comment-sentiment'
import { sentimentProviderEnum } from './enums/sentiment-provider'

export const commentSentiment = pgTable('comments_sentiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: sentimentProviderEnum('provider').notNull(),
  sentiment: commentSentimentEnum('sentiment').notNull(),
  commentId: uuid('comment_id')
    .notNull()
    .references(() => comment.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const commentSentimentRelations = relations(
  commentSentiment,
  ({ one }) => ({
    comment: one(comment, {
      fields: [commentSentiment.commentId],
      references: [comment.id],
    }),
  }),
)
