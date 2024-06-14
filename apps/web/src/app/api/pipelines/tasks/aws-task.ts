import { db } from '@vizo/drizzle'
import { commentSentiment, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
import { Comprehend } from 'aws-sdk'
import { eq } from 'drizzle-orm'

import { LogSymbol } from '@/utils/log-symbol'

import { TaskFile } from '../task-file'

interface AwsTaskOptions {
  taskId: string
  pipelineId: string
  onFailed: () => void | Promise<void>
}

export async function awsTask({
  taskId,
  pipelineId,
  onFailed,
}: AwsTaskOptions) {
  const taskFile = new TaskFile(taskId)

  try {
    await db
      .update(task)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(task.id, taskId))

    const comprehend = new Comprehend({
      region: 'us-east-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })

    const comments = await db.query.comment.findMany({
      where(fields, { eq }) {
        return eq(fields.pipelineId, pipelineId)
      },
    })

    for (const c of comments) {
      const index = comments.indexOf(c) + 1

      const percentage = (index / comments.length) * 100

      const analysis = await comprehend
        .detectSentiment({
          LanguageCode: 'pt',
          Text: c.message,
        })
        .promise()

      const status = {
        positive: LogSymbol.SUCCESS,
        negative: LogSymbol.ERROR,
        neutral: LogSymbol.INFO,
        mixed: LogSymbol.WARNING,
      }

      const sentiment = analysis.Sentiment?.toLowerCase() as
        | 'positive'
        | 'negative'
        | 'neutral'
        | 'mixed'

      await db.insert(commentSentiment).values({
        commentId: c.id,
        sentiment,
        provider: 'aws',
      })

      taskFile.addLine({
        type: 'text',
        content:
          percentage + '% ' + status[sentiment] + ` ${sentiment} - ${c.id}`,
      })

      await taskFile.save()
    }

    await db
      .update(task)
      .set({ status: 'completed', finishedAt: new Date() })
      .where(eq(task.id, taskId))
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : null

    taskFile.addLine({
      type: 'text',
      content:
        LogSymbol.ERROR +
        ' An error occurred while analyzing comments\n\n' +
        message,
    })

    await taskFile.save()

    await onFailed()
  }
}
