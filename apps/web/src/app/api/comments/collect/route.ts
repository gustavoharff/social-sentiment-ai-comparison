import { auth } from '@vizo/auth'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
