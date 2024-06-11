import Image from 'next/image'

import logo from '@/assets/logo.svg'
import { FacebookButton } from '@/components/buttons/facebook-button'

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-8">
          <Image
            src={logo}
            alt="Vizo Logo"
            className="size-12"
            width={48}
            height={48}
          />

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Vizo</h1>
            <p className="text-sm opacity-80">
              Comparação de Serviços em Nuvem para Análise de Sentimentos
            </p>
          </div>
        </div>

        <FacebookButton />
      </div>
    </main>
  )
}
