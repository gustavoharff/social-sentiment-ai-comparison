import { Button } from 'antd'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/logo.svg'

export const metadata: Metadata = {
  title: 'Access denied',
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-8">
          <Image
            src={logo}
            alt="Logo"
            className="size-12"
            width={48}
            height={48}
          />

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Access denied!
            </h1>
            <p className="text-sm leading-relaxed opacity-80">
              It looks like an error has ocurred while you were trying to
              authenticate.
            </p>
          </div>
          <Button className="w-full">
            <Link href="/auth/sign-in">Try again</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
