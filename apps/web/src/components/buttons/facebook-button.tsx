'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from '@ant-design/icons'
import { Button } from 'antd'
import { signIn } from 'next-auth/react'
import { ComponentProps, ForwardRefExoticComponent } from 'react'

import { FacebookIcon } from '../icons/facebook-icon'

export function FacebookButton(props: ComponentProps<typeof Button>) {
  async function handleLogin() {
    await signIn('facebook', {
      callbackUrl: '/',
    })
  }

  return (
    <Button
      type="primary"
      icon={<Icon component={FacebookIcon as ForwardRefExoticComponent<any>} />}
      onClick={handleLogin}
      {...props}
    >
      Sign in with Facebook
    </Button>
  )
}
