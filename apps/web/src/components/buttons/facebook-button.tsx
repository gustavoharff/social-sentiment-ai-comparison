"use client";

import { ComponentProps, ForwardRefExoticComponent } from "react";
import { FacebookIcon } from "../icons/facebook-icon";
import { Button } from "antd";
import { signIn } from "next-auth/react";
import Icon from "@ant-design/icons";

export function FacebookButton(props: ComponentProps<typeof Button>) {
  async function handleLogin() {
    await signIn("facebook", {
      callbackUrl: "/",
    });
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
  );
}
