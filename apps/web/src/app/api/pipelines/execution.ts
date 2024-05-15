import { db } from '@vizo/drizzle'
import { task } from '@vizo/drizzle/schema'
import { generateSasUrl, upload } from '@vizo/storage'
import axios from 'axios'
import { eq } from 'drizzle-orm'

import { awsTask } from './tasks/aws-task'
import { facebookTask } from './tasks/facebook-task'

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

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, googleTaskId))

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const googleTaskFileUrl = await generateSasUrl({
    name: `task-${googleTaskId}`,
    contentType: 'application/json',
  })

  const { data: googleTaskFile } = await axios.get<object[]>(googleTaskFileUrl)

  for (let i = 0; i <= 4; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 4) * 100

    googleTaskFile.push({
      type: 'text',
      content: `Processing ${percentage}%...`,
    })

    await upload({
      blob: Buffer.from(JSON.stringify(googleTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(googleTaskFile).length,
      name: `task-${googleTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, googleTaskId))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, azureTaskId))

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const azureTaskFileUrl = await generateSasUrl({
    name: `task-${azureTaskId}`,
    contentType: 'application/json',
  })

  const { data: azureTaskFile } = await axios.get<object[]>(azureTaskFileUrl)

  for (let i = 0; i <= 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 5) * 100

    azureTaskFile.push({
      type: 'text',
      content: `Processing ${percentage}%...`,
    })

    await upload({
      blob: Buffer.from(JSON.stringify(azureTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(azureTaskFile).length,
      name: `task-${azureTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, azureTaskId))
}
