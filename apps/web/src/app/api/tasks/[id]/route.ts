import { db } from '@vizo/drizzle'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id

  const drizzleTadk = await db.query.task.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id)
    },
  })

  if (!drizzleTadk) {
    return NextResponse.json({ message: 'Tadk not found' }, { status: 404 })
  }

  return NextResponse.json(drizzleTadk)
}
