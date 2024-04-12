import { auth } from '@vizo/auth'
import { db } from '@vizo/drizzle'
import { pipeline, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
import { FacebookSDK } from '@vizo/facebook-sdk'
import { upload } from '@vizo/storage'
import axios from 'axios'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { execution } from './execution'

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
        name: 'Comments collection',
        type: 'comments-collection',
        pipelineId,
      })
      .returning()

    const lines = [
      {
        type: 'text',
        content: 'Starting comments collection for page: ' + page.name,
      },
    ]

    const commentsTaskLogs = await upload({
      blob: Buffer.from(JSON.stringify(lines)),
      contentType: 'application/json',
      length: JSON.stringify(lines).length,
      name: `task-${commentsTask.id}`,
    })

    await db
      .update(task)
      .set({ fileUrl: commentsTaskLogs })
      .where(eq(task.id, commentsTask.id))

    const [awsTask] = await db
      .insert(task)
      .values({
        name: 'AWS Analysis',
        type: 'aws-analysis',
        pipelineId,
      })
      .returning()

    const awsTaskLogs = await upload({
      blob: Buffer.from(JSON.stringify([])),
      contentType: 'application/json',
      length: JSON.stringify([]).length,
      name: `task-${awsTask.id}`,
    })

    await db
      .update(task)
      .set({ fileUrl: awsTaskLogs })
      .where(eq(task.id, awsTask.id))

    const [googleTask] = await db
      .insert(task)
      .values({
        name: 'Google analysis',
        type: 'google-analysis',
        pipelineId,
      })
      .returning()

    const googleTaskLogs = await upload({
      blob: Buffer.from(JSON.stringify([])),
      contentType: 'application/json',
      length: JSON.stringify([]).length,
      name: `task-${googleTask.id}`,
    })

    await db
      .update(task)
      .set({ fileUrl: googleTaskLogs })
      .where(eq(task.id, googleTask.id))

    const [azureTask] = await db
      .insert(task)
      .values({
        name: 'Azure analysis',
        type: 'azure-analysis',
        pipelineId,
      })
      .returning()

    const azureTaskLogs = await upload({
      blob: Buffer.from(JSON.stringify([])),
      contentType: 'application/json',
      length: JSON.stringify([]).length,
      name: `task-${azureTask.id}`,
    })

    await db
      .update(task)
      .set({ fileUrl: azureTaskLogs })
      .where(eq(task.id, azureTask.id))

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
