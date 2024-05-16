import { db } from '@vizo/drizzle'
import { task } from '@vizo/drizzle/schema'
import { eq } from 'drizzle-orm'

import { awsTask } from './tasks/aws-task'
import { azureTask } from './tasks/azure-task'
import { facebookTask } from './tasks/facebook-task'
import { googleTask } from './tasks/google-task'

interface ExectionOptions {
  pageId: string
  accessToken: string
  pipelineId: string
  commentsTaskId: string
  awsTaskId: string
  googleTaskId: string
  azureTaskId: string
}

export async function execution(options: ExectionOptions) {
  const {
    pageId,
    accessToken,
    pipelineId,
    commentsTaskId,
    awsTaskId,
    googleTaskId,
    azureTaskId,
  } = options

  await facebookTask({
    accessToken,
    pageId,
    pipelineId,
    taskId: commentsTaskId,
    onFailed: async () => {
      await db
        .update(task)
        .set({ status: 'failed', finishedAt: new Date() })
        .where(eq(task.id, commentsTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, awsTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, googleTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, azureTaskId))
    },
  })

  await awsTask({
    pipelineId,
    taskId: awsTaskId,
    onFailed: async () => {
      await db
        .update(task)
        .set({ status: 'failed', finishedAt: new Date() })
        .where(eq(task.id, awsTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, googleTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, azureTaskId))
    },
  })

  await googleTask({
    pipelineId,
    taskId: googleTaskId,
    onFailed: async () => {
      await db
        .update(task)
        .set({ status: 'failed', finishedAt: new Date() })
        .where(eq(task.id, googleTaskId))

      await db
        .update(task)
        .set({ status: 'cancelled' })
        .where(eq(task.id, azureTaskId))
    },
  })

  await azureTask({
    pipelineId,
    taskId: azureTaskId,
    onFailed: async () => {
      await db
        .update(task)
        .set({ status: 'failed' })
        .where(eq(task.id, azureTaskId))
    },
  })
}
