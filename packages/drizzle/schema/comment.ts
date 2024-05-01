import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { commentSentiment } from './comment-sentiment'
import { commentSentimentEnum } from './enums/comment-sentiment'
import { pipeline } from './pipeline'

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

export const commentRelations = relations(comment, ({ one, many }) => ({
  pipeline: one(pipeline, {
    fields: [comment.pipelineId],
    references: [pipeline.id],
  }),
  sentiments: many(commentSentiment),
}))
