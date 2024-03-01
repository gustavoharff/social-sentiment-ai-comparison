'use client'

import { ComponentProps } from "react";
import { FacebookIcon } from "../icons/facebook-icon";
import { Button } from "../ui/button";
import { signIn } from 'next-auth/react'

export function FacebookButton(props: ComponentProps<typeof Button>) {
  async function handleLogin() {
    await signIn("facebook", {
      callbackUrl: "/",
    });
  }

  return (
    <Button variant="outline" onClick={handleLogin} {...props}>
      <FacebookIcon className="mr-2 h-4 w-4" />
      Sign in with Facebook
    </Button>
  );
}
