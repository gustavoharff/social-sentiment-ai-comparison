import { auth } from '@vizo/auth'
import { db } from '@vizo/drizzle'
import { pipeline, task } from '@vizo/drizzle/schema'
import { env } from '@vizo/env'
import { FacebookSDK } from '@vizo/facebook-sdk'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET() {
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  const json = await request.json()

  const session = await auth()

  // @ts-expect-error  - salt is optional
  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
  })

  console.log('token', token)

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
        pageId: page.id,
        accountId: account.id,
        userId: token.sub!,
      })
      .returning()

    await db.insert(task).values({
      name: 'comments-collection',
      type: 'comments-collection',
      pipelineId,
    })

    await db.insert(task).values({
      name: 'aws-analysis',
      type: 'aws-analysis',
      pipelineId,
    })

    await db.insert(task).values({
      name: 'google-analysis',
      type: 'google-analysis',
      pipelineId,
    })

    await db.insert(task).values({
      name: 'azure-analysis',
      type: 'azure-analysis',
      pipelineId,
    })

    const drizzlePipeline = await db.query.pipeline.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, pipelineId)
      },
      with: {
        tasks: true,
      },
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
