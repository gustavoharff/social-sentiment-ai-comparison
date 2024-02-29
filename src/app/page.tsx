import { FacebookButton } from "@/components/buttons/facebook-button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <FacebookButton />
      </div>
    </main>
  );
}
