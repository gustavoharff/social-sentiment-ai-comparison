import { auth } from '@vizo/auth'
import { db } from '@vizo/drizzle'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()

  if (!session || !session.user.id) {
    return NextResponse.json(
      { message: 'You must be authenticated to access this resource' },
      { status: 401 },
    )
  }

  const comments = await db.query.comment.findMany({
    where(fields, { eq }) {
      return eq(fields.pipelineId, params.id)
    },
    with: {
      sentiments: true,
    },
  })

  return NextResponse.json(comments)
}
