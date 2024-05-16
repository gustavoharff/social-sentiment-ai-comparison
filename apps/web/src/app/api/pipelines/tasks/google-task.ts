import language from '@google-cloud/language'
import { db } from '@vizo/drizzle'
import { commentSentiment, task } from '@vizo/drizzle/schema'
import { eq } from 'drizzle-orm'

import { LogSymbol } from '@/utils/log-symbol'

import { TaskFile } from '../task-file'

interface GoogleTaskOptions {
  taskId: string
  pipelineId: string
  onFailed: () => void | Promise<void>
}

export async function googleTask({
  taskId,
  pipelineId,
  onFailed,
}: GoogleTaskOptions) {
  const taskFile = new TaskFile(taskId)

  try {
    await db
      .update(task)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(task.id, taskId))

    const client = new language.LanguageServiceClient()

    const comments = await db.query.comment.findMany({
      where(fields, { eq }) {
        return eq(fields.pipelineId, pipelineId)
      },
    })

    for (const c of comments) {
      const index = comments.indexOf(c) + 1

      const percentage = (index / comments.length) * 100

      const [result] = await client.analyzeSentiment({
        document: {
          content: c.message,
          type: 'PLAIN_TEXT',
        },
      })

      const status = {
        positive: LogSymbol.SUCCESS,
        negative: LogSymbol.ERROR,
        neutral: LogSymbol.INFO,
        mixed: LogSymbol.WARNING,
      }

      const sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = (() => {
        if (
          !result.documentSentiment ||
          result.documentSentiment.score === null ||
          result.documentSentiment.score === undefined ||
          result.documentSentiment.magnitude === null ||
          result.documentSentiment.magnitude === undefined
        ) {
          return 'neutral'
        }

        // REVISAR

        if (result.documentSentiment.score > 0) {
          return 'positive'
        }

        if (result.documentSentiment.score < 0) {
          return 'negative'
        }

        if (result.documentSentiment.magnitude > 0) {
          return 'mixed'
        }

        return 'neutral'
      })()

      await db.insert(commentSentiment).values({
        commentId: c.id,
        sentiment,
        provider: 'google',
      })

      taskFile.addLine({
        type: 'text',
        content: '--------------------------------------------------',
      })

      taskFile.addLine({
        type: 'text',
        content: `Message: ${c.message}`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Score: ${result.documentSentiment?.score}`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Magnitude: ${result.documentSentiment?.magnitude}`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Sentiment: ${sentiment}`,
      })

      taskFile.addLine({
        type: 'text',
        content: '--------------------------------------------------',
      })

      await taskFile.save()
    }

    await db
      .update(task)
      .set({ status: 'completed', finishedAt: new Date() })
      .where(eq(task.id, taskId))
  } catch (error) {
    taskFile.addLine({
      type: 'text',
      content: LogSymbol.ERROR + ' An error occurred while analyzing comments',
    })

    await taskFile.save()

    await onFailed()
  }
}
