import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { pipeline } from './pipeline'

export const commentSentimentEnum = pgEnum('comments_sentiment', [
  'positive',
  'negative',
  'neutral',
])

export const comment = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: text('comment_id').notNull(),
  pageId: text('page_id').notNull(),
  message: text('title').notNull(),
  sentiment: commentSentimentEnum('sentiment'),
  publishedAt: timestamp('published_at').notNull(),
  pipelineId: uuid('pipeline_id')
    .notNull()
    .references(() => pipeline.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const commentRelations = relations(comment, ({ one }) => ({
  pipeline: one(pipeline, {
    fields: [comment.pipelineId],
    references: [pipeline.id],
  }),
}))
