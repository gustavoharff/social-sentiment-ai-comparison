import { auth } from '@vizo/auth'
import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/logo.svg'

import { LogoutButton } from '../buttons/logout-button'
import { ThemeToggle } from '../theme-toggle'

export async function Header() {
  const session = await auth()

  if (!session || !session.user) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-solid border-[var(--default-border)] p-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src={logo} alt="Vizo Logo" className="size-7" />
        </Link>

        <svg
          className="text-[var(--default-border)]"
          fill="none"
          width="24"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M16.88 3.549L7.12 20.451" />
        </svg>

        {session.user.image && (
          <Image
            className="size-6 rounded-full"
            src={session.user.image}
            alt={session.user.name ?? ''}
            width={24}
            height={24}
          />
        )}

        <span className="font-semibold">{session.user.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <LogoutButton />
      </div>
    </div>
  )
}
