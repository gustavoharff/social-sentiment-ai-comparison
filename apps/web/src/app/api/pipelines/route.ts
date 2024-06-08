import { auth } from '@vizo/auth'
import { db } from '@vizo/drizzle'
import { pipeline, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
import { FacebookSDK } from '@vizo/facebook-sdk'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { execution } from './execution'
import { TaskFile } from './task-file'

export async function GET() {
  const session = await auth()

  if (!session || !session.user.id) {
    return NextResponse.json(
      { message: 'You must be authenticated to access this resource' },
      { status: 401 },
    )
  }

  const pipelines = await db.query.pipeline.findMany({
    where(fields, { eq }) {
      return eq(fields.userId, session.user.id!)
    },
    with: {
      comments: true,
      tasks: {
        orderBy(fields, { asc }) {
          return asc(fields.createdAt)
        },
      },
    },
    orderBy(fields, { desc }) {
      return desc(fields.createdAt)
    },
  })

  return NextResponse.json(pipelines)
}

export async function POST(request: NextRequest) {
  const json = await request.json()

  const session = await auth()

  // @ts-expect-error  - salt is optional
  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
  })

  if (!token || !token.accessToken || !session || !token.providerAccountId) {
    return NextResponse.json(
      { message: 'You must be authenticated to access this resource' },
      { status: 401 },
    )
  }

  try {
    const id = json.id

    const page = await new FacebookSDK(token.accessToken).pages().getPage(id)

    const account = await db.query.account.findFirst({
      where(fields, { eq }) {
        return eq(fields.providerAccountId, token.providerAccountId!)
      },
    })

    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 },
      )
    }

    const [{ id: pipelineId }] = await db
      .insert(pipeline)
      .values({
        title: page.name,
        pageId: page.id,
        accountId: account.id,
        userId: token.sub!,
      })
      .returning()

    const [commentsTask] = await db
      .insert(task)
      .values({
        name: 'Coleta de comentários',
        type: 'comments-collection',
        pipelineId,
      })
      .returning()

    const commentsTaskFile = new TaskFile(commentsTask.id)

    await commentsTaskFile.create()

    commentsTaskFile.addLine({
      type: 'text',
      content: 'Starting comments collection for page: ' + page.name,
    })

    await commentsTaskFile.save()

    const commentsTaskFileUrl = await commentsTaskFile.generateSasUrl()

    await db
      .update(task)
      .set({ fileUrl: commentsTaskFileUrl })
      .where(eq(task.id, commentsTask.id))

    const [awsTask] = await db
      .insert(task)
      .values({
        name: 'Análise Comprehend (AWS)',
        type: 'aws-analysis',
        pipelineId,
      })
      .returning()

    const awsTaskFile = new TaskFile(awsTask.id)

    await awsTaskFile.create()

    awsTaskFile.addLine({
      type: 'text',
      content: 'Starting AWS analysis for page: ' + page.name,
    })

    await awsTaskFile.save()

    const awsTaskFileUrl = await awsTaskFile.generateSasUrl()

    await db
      .update(task)
      .set({ fileUrl: awsTaskFileUrl })
      .where(eq(task.id, awsTask.id))

    const [googleTask] = await db
      .insert(task)
      .values({
        name: 'Análise Cloud Natural Language (Google)',
        type: 'google-analysis',
        pipelineId,
      })
      .returning()

    const googleTaskFile = new TaskFile(googleTask.id)

    await googleTaskFile.create()

    googleTaskFile.addLine({
      type: 'text',
      content: 'Starting Google analysis for page: ' + page.name,
    })

    await googleTaskFile.save()

    const googleTaskFileUrl = await googleTaskFile.generateSasUrl()

    await db
      .update(task)
      .set({ fileUrl: googleTaskFileUrl })
      .where(eq(task.id, googleTask.id))

    const [azureTask] = await db
      .insert(task)
      .values({
        name: 'Análise Text Analytics (Azure)',
        type: 'azure-analysis',
        pipelineId,
      })
      .returning()

    const azureTaskFile = new TaskFile(azureTask.id)

    await azureTaskFile.create()

    azureTaskFile.addLine({
      type: 'text',
      content: 'Starting Azure analysis for page: ' + page.name,
    })

    await azureTaskFile.save()

    const azureTaskFileUrl = await azureTaskFile.generateSasUrl()

    await db
      .update(task)
      .set({ fileUrl: azureTaskFileUrl })
      .where(eq(task.id, azureTask.id))

    const [promoteSentimentsTask] = await db
      .insert(task)
      .values({
        name: 'Promote sentiments',
        type: 'promote-sentiments',
        pipelineId,
      })
      .returning()

    const promoteSentimentsTaskFile = new TaskFile(promoteSentimentsTask.id)

    await promoteSentimentsTaskFile.create()

    promoteSentimentsTaskFile.addLine({
      type: 'text',
      content: 'Starting Azure analysis for page: ' + page.name,
    })

    await promoteSentimentsTaskFile.save()

    const promoteSentimentsTaskFileUrl =
      await promoteSentimentsTaskFile.generateSasUrl()

    await db
      .update(task)
      .set({ fileUrl: promoteSentimentsTaskFileUrl })
      .where(eq(task.id, promoteSentimentsTask.id))

    const drizzlePipeline = await db.query.pipeline.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, pipelineId)
      },
      with: {
        tasks: true,
      },
    })

    execution({
      pageId: page.id,
      accessToken: page.access_token,
      pipelineId,
      commentsTaskId: commentsTask.id,
      awsTaskId: awsTask.id,
      googleTaskId: googleTask.id,
      azureTaskId: azureTask.id,
      promoteSentimentsTaskId: promoteSentimentsTask.id,
    })

    return NextResponse.json(drizzlePipeline)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(error.response?.data, {
        status: error.response?.status,
      })
    }

    return NextResponse.json(
      { message: 'An error occurred while fetching pages' },
      { status: 500 },
    )
  }
}
