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
        if (
          positivePercentage > negativePercentage &&
          positivePercentage > neutralPercentage &&
          positivePercentage > mixedPercentage
        ) {
          return 'positive'
        }

        if (
          negativePercentage > positivePercentage &&
          negativePercentage > neutralPercentage &&
          negativePercentage > mixedPercentage
        ) {
          return 'negative'
        }

        if (
          neutralPercentage > positivePercentage &&
          neutralPercentage > negativePercentage &&
          neutralPercentage > mixedPercentage
        ) {
          return 'neutral'
        }

        if (
          mixedPercentage > positivePercentage &&
          mixedPercentage > negativePercentage &&
          mixedPercentage > neutralPercentage
        ) {
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
        content: `Comentário: ${c.message}`,
      })

      let positiveText = ''
      if (sentiment === 'positive') {
        positiveText = '\\u001b[32m'
      }
      positiveText = positiveText + 'positive: ' + positivePercentage + '%'
      if (sentiment === 'positive') {
        positiveText = positiveText + '\\u001b[0m'
      }

      let negativeText = ''
      if (sentiment === 'negative') {
        negativeText = '\\u001b[31m'
      }
      negativeText = negativeText + 'negative: ' + negativePercentage + '%'
      if (sentiment === 'negative') {
        negativeText = negativeText + '\\u001b[0m'
      }

      let neutralText = ''
      if (sentiment === 'neutral') {
        neutralText = '\\u001b[34m'
      }
      neutralText = neutralText + 'neutral: ' + neutralPercentage + '%'
      if (sentiment === 'neutral') {
        neutralText = neutralText + '\\u001b[0m'
      }

      let mixedText = ''
      if (sentiment === 'mixed') {
        mixedText = '\\u001b[33m'
      }
      mixedText = mixedText + 'mixed: ' + mixedPercentage + '%'
      if (sentiment === 'mixed') {
        mixedText = mixedText + '\\u001b[0m'
      }

      taskFile.addLine({
        type: 'text',
        content: [positiveText, negativeText, neutralText, mixedText].join(
          ', ',
        ),
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
