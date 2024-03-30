import { db } from '@vizo/drizzle'
import { task } from '@vizo/drizzle/schema'
import { generateSasUrl, upload } from '@vizo/storage'
import axios from 'axios'
import { eq } from 'drizzle-orm'

interface ExectionOptions {
  commentsTaskId: string
  awsTaskId: string
  googleTaskId: string
  azureTaskId: string
}

export async function execution(options: ExectionOptions) {
  const { commentsTaskId, awsTaskId, googleTaskId, azureTaskId } = options

  await new Promise((resolve) => setTimeout(resolve, 1000))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, commentsTaskId))

  const commentsTaskFileUrl = await generateSasUrl({
    name: `task-${commentsTaskId}`,
    contentType: 'application/json',
  })

  const { data: commentsTaskFile } =
    await axios.get<object[]>(commentsTaskFileUrl)

  for (let i = 0; i <= 6; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    commentsTaskFile.push({ type: 'text', content: `Comment ${i}` })

    await upload({
      blob: Buffer.from(JSON.stringify(commentsTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(commentsTaskFile).length,
      name: `task-${commentsTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, commentsTaskId))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, awsTaskId))

  const awsTaskFileUrl = await generateSasUrl({
    name: `task-${awsTaskId}`,
    contentType: 'application/json',
  })

  const { data: awsTaskFile } = await axios.get<object[]>(awsTaskFileUrl)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  for (let i = 0; i <= 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 3) * 100

    awsTaskFile.push({ type: 'text', content: `Processing ${percentage}%...` })

    await upload({
      blob: Buffer.from(JSON.stringify(awsTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(awsTaskFile).length,
      name: `task-${awsTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, awsTaskId))

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
