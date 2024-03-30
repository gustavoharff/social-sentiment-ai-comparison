import { env } from '@vizo/env'
import { FacebookSDK } from '@vizo/facebook-sdk'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  // @ts-expect-error  - salt is optional
  const token = await getToken({
    req,
    secret: env.AUTH_SECRET,
  })

  if (!token || !token.accessToken) {
    return NextResponse.json(
      { message: 'You must be authenticated to access this resource' },
      { status: 401 },
    )
  }

  try {
    const pages = await new FacebookSDK(token.accessToken).pages().getPages()

    return NextResponse.json({
      ...pages,
      data: pages.data.map((page) => ({
        id: page.id,
        name: page.name,
      })),
    })
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
