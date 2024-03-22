import { auth } from '@vizo/auth'
import Image from 'next/image'

import { LogoutButton } from '../buttons/logout-button'

export async function Header() {
  const session = await auth()

  if (!session || !session.user) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 p-4">
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            className="rounded-full"
            src={session.user.image}
            alt={session.user.name ?? ''}
            width={42}
            height={42}
          />
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{session.user.name}</span>
          <span className="text-sm opacity-80">{session.user.email}</span>
        </div>
      </div>

      <LogoutButton />
    </div>
  )
}
