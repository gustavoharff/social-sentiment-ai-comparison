import { db } from '@vizo/drizzle'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id

  const drizzlePipeline = await db.query.pipeline.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id)
    },
    with: {
      tasks: true,
    },
  })

  if (!drizzlePipeline) {
    return NextResponse.json({ message: 'Pipeline not found' }, { status: 404 })
  }

  return NextResponse.json(drizzlePipeline)
}
