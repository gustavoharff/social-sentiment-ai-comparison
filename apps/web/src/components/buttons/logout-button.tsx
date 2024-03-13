"use client";

import { signOut } from "next-auth/react";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await signOut();

    router.push('/auth/sign-in');
  }

  return <Button onClick={handleLogout}>Logout</Button>;
}
