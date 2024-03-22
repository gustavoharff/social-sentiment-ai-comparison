'use client'

import { Button } from 'antd'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await signOut()

    router.push('/auth/sign-in')
  }

  return <Button onClick={handleLogout}>Logout</Button>
}
