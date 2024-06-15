import language from '@google-cloud/language'
import { db } from '@vizo/drizzle'
import { commentSentiment, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
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

    const client = new language.LanguageServiceClient({
      credentials: {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        quota_project_id: env.GOOGLE_QUOTA_PROJECT_ID,
        refresh_token: env.GOOGLE_REFRESH_TOKEN,
        universe_domain: 'googleapis.com',
        type: 'authorized_user',
      },
    })

    const comments = await db.query.comment.findMany({
      where(fields, { eq }) {
        return eq(fields.pipelineId, pipelineId)
      },
    })

    for (const c of comments) {
      const [result] = await client.analyzeSentiment({
        document: {
          content: c.message,
          type: 'PLAIN_TEXT',
          language: 'pt',
        },
      })

      const sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = (() => {
        const { score, magnitude } = result.documentSentiment || {}

        if (
          score === null ||
          score === undefined ||
          magnitude === null ||
          magnitude === undefined
        ) {
          return 'neutral'
        }

        if (score >= 0.5 && magnitude >= 1.5) {
          return 'positive'
        } else if (score <= 0 && magnitude >= 0.5) {
          return 'negative'
        } else if (score >= 0 && score <= 0.1 && magnitude < 1.5) {
          return 'neutral'
        } else if (score >= -0.1 && score <= 0.1 && magnitude >= 1.5) {
          return 'mixed'
        } else {
          return 'neutral'
        }
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
        content: `Comentário: ${c.message}`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Score: ${result.documentSentiment?.score}`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Magnitude: ${result.documentSentiment?.magnitude}`,
      })

      const status = {
        positive: LogSymbol.SUCCESS,
        negative: LogSymbol.ERROR,
        neutral: LogSymbol.INFO,
        mixed: LogSymbol.WARNING,
      }

      taskFile.addLine({
        type: 'text',
        content: `Sentimento: ${status[sentiment]} ${sentiment}`,
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
