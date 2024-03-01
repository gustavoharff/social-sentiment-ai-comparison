import { auth, signOut } from "@/auth";
import Image from "next/image";
import { Button } from "../ui/button";
import { LogoutButton } from "../buttons/logout-button";

export async function Header() {
  const session = await auth();

  if (!session || !session.user) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-4 justify-between">
      <div className="flex gap-2 items-center">
        {session.user.image && (
          <Image
            className="rounded-full"
            src={session.user.image}
            alt={session.user.name ?? ""}
            width={42}
            height={42}
          />
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{session.user.name}</span>
          <span className="opacity-80 text-sm">{session.user.email}</span>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
