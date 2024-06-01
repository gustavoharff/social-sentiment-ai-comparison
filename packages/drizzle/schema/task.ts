import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { pipeline } from '.'

export const taskStatusEnum = pgEnum('tasks_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
])

export const taskType = pgEnum('tasks_type', [
  'comments-collection',
  'aws-analysis',
  'google-analysis',
  'azure-analysis',
  'promote-sentiments',
])

export const task = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: taskType('type').notNull(),
  status: taskStatusEnum('status').notNull().default('pending'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  pipelineId: uuid('pipeline_id')
    .notNull()
    .references(() => pipeline.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const taskRelations = relations(task, ({ one }) => ({
  pipeline: one(pipeline, {
    fields: [task.pipelineId],
    references: [pipeline.id],
  }),
}))
