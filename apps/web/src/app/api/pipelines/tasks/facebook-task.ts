import { db } from '@vizo/drizzle'
import { comment, task } from '@vizo/drizzle/schema'
import { FacebookSDK } from '@vizo/facebook-sdk'
import { eq } from 'drizzle-orm'

import { LogSymbol } from '@/utils/log-symbol'

import { TaskFile } from '../task-file'

interface FacebookTaskOptions {
  taskId: string
  accessToken: string
  pageId: string
  pipelineId: string
  onFailed: () => void | Promise<void>
}

export async function facebookTask({
  taskId,
  accessToken,
  pageId,
  pipelineId,
  onFailed,
}: FacebookTaskOptions) {
  const taskFile = new TaskFile(taskId)

  await taskFile.create()

  try {
    await db
      .update(task)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(task.id, taskId))

    taskFile.addLine({
      type: 'text',
      content: 'Starting comments collection for page: ' + pageId,
    })

    const sdk = new FacebookSDK(accessToken)

    taskFile.addLine({
      type: 'text',
      content: 'Fetching posts for page: ' + pageId,
    })

    await taskFile.save()

    const posts = await sdk.posts().getPosts(pageId)

    taskFile.addLine({
      type: 'text',
      content: LogSymbol.INFO + ' Found ' + posts.length + ' posts',
    })

    for (const post of posts) {
      taskFile.addLine({
        type: 'text',
        content: 'Fetching comments for post: ' + post.id,
      })

      await taskFile.save()

      const comments = await sdk.comments().getComments(post.id)

      taskFile.addLine({
        type: 'text',
        content: LogSymbol.INFO + ' Found ' + comments.length + ' comments',
      })

      for (const c of comments) {
        await taskFile.save()

        await db.insert(comment).values({
          commentId: c.id,
          pageId,
          message: c.message,
          publishedAt: new Date(c.created_time),
          pipelineId,
        })

        taskFile.addLine({
          type: 'text',
          content: LogSymbol.SUCCESS + ' Saved comment: ' + c.id,
        })

        await taskFile.save()
      }
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
        ' An error occurred while fetching posts\n\n' +
        message,
    })

    await taskFile.save()

    await onFailed()

    throw error
  }
}
