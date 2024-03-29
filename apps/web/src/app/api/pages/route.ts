import { env } from '@vizo/env'
import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

interface Page {
  id: string
  name: string
}

interface PagesResponse {
  data: Page[]
}

export async function GET(req: NextRequest) {
  // @ts-expect-error  - salt is optional
  const token = await getToken({
    req,
    secret: env.AUTH_SECRET,
  })

  try {
    const response = await axios.get<PagesResponse>(
      'https://graph.facebook.com/me/accounts',
      {
        params: {
          access_token: token?.accessToken,
        },
      },
    )

    return NextResponse.json({
      ...response.data,
      data: response.data.data.map((page) => ({
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
