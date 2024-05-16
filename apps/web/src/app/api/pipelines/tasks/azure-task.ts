import { AzureKeyCredential, TextAnalysisClient } from '@azure/ai-language-text'
import { db } from '@vizo/drizzle'
import { commentSentiment, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
import { eq } from 'drizzle-orm'

import { LogSymbol } from '@/utils/log-symbol'

import { TaskFile } from '../task-file'

interface AzureTaskOptions {
  taskId: string
  pipelineId: string
  onFailed: () => void | Promise<void>
}

export async function azureTask({
  taskId,
  pipelineId,
  onFailed,
}: AzureTaskOptions) {
  const taskFile = new TaskFile(taskId)

  try {
    await db
      .update(task)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(task.id, taskId))

    const client = new TextAnalysisClient(
      env.AZURE_LANGUAGE_ENDPOINT,
      new AzureKeyCredential(env.AZURE_LANGUAGE_KEY),
    )

    const comments = await db.query.comment.findMany({
      where(fields, { eq }) {
        return eq(fields.pipelineId, pipelineId)
      },
    })

    for (const c of comments) {
      const index = comments.indexOf(c) + 1

      const percentage = (index / comments.length) * 100

      const [analysis] = await client.analyze(
        'SentimentAnalysis',
        [
          {
            id: c.id,
            text: c.message,
            language: 'pt',
          },
        ],
        { includeOpinionMining: true },
      )

      const status = {
        positive: LogSymbol.SUCCESS,
        negative: LogSymbol.ERROR,
        neutral: LogSymbol.INFO,
        mixed: LogSymbol.WARNING,
      }

      if (analysis.error) {
        return // Dar atenção aqui
      }

      const sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' =
        analysis.sentiment

      await db.insert(commentSentiment).values({
        commentId: c.id,
        sentiment,
        provider: 'azure',
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
    taskFile.addLine({
      type: 'text',
      content: LogSymbol.ERROR + ' An error occurred while analyzing comments',
    })

    await taskFile.save()

    await onFailed()
  }
}
