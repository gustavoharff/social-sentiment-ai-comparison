import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { account, comment, user } from '.'
import { task } from './task'

export const pipeline = pgTable('pipelines', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: text('page_id').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => account.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const pipelineRelations = relations(pipeline, ({ one, many }) => ({
  account: one(account, {
    fields: [pipeline.accountId],
    references: [account.id],
  }),
  user: one(user, {
    fields: [pipeline.userId],
    references: [user.id],
  }),
  tasks: many(task),
  comments: many(comment),
}))
