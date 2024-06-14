import { db } from '@vizo/drizzle'
import { comment, task } from '@vizo/drizzle/schema'
import { eq } from 'drizzle-orm'

import { LogSymbol } from '@/utils/log-symbol'

import { TaskFile } from '../task-file'

interface PromoteSentimentsTaskOptions {
  taskId: string
  pipelineId: string
  onFailed: () => void | Promise<void>
}

export async function promoteSentimentsTask({
  taskId,
  pipelineId,
  onFailed,
}: PromoteSentimentsTaskOptions) {
  const taskFile = new TaskFile(taskId)

  try {
    await db
      .update(task)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(task.id, taskId))

    const comments = await db.query.comment.findMany({
      where(fields, { eq }) {
        return eq(fields.pipelineId, pipelineId)
      },
      with: {
        sentiments: true,
      },
    })

    for (const c of comments) {
      const positiveCount = c.sentiments.filter(
        (s) => s.sentiment === 'positive',
      ).length
      const negativeCount = c.sentiments.filter(
        (s) => s.sentiment === 'negative',
      ).length
      const neutralCount = c.sentiments.filter(
        (s) => s.sentiment === 'neutral',
      ).length
      const mixedCount = c.sentiments.filter(
        (s) => s.sentiment === 'mixed',
      ).length

      const total = c.sentiments.length

      const positivePercentage = (positiveCount / total) * 100
      const negativePercentage = (negativeCount / total) * 100
      const neutralPercentage = (neutralCount / total) * 100
      const mixedPercentage = (mixedCount / total) * 100

      const sentiment = (() => {
        if (positivePercentage > 50) {
          return 'positive'
        }

        if (negativePercentage > 50) {
          return 'negative'
        }

        if (mixedPercentage > 50) {
          return 'mixed'
        }

        return 'neutral'
      })()

      await db.update(comment).set({ sentiment }).where(eq(comment.id, c.id))

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
        content: `Positive: ${positivePercentage}%`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Negative: ${negativePercentage}%`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Neutral: ${neutralPercentage}%`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Mixed: ${mixedPercentage}%`,
      })

      taskFile.addLine({
        type: 'text',
        content: `Sentiment: ${sentiment}`,
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
