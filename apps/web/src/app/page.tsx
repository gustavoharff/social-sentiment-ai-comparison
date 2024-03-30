'use client'

import { CommentOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'

import { StartCollectionDialog } from '@/components/start-collection-dialog'
import { useCustomModal } from '@/hooks/use-custom-modal'

export default function Home() {
  const modal = useCustomModal()

  return (
    <main className="mt-4 flex flex-grow flex-col items-center justify-center">
      <div className="mx-auto mb-[10%] flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col items-center gap-4 space-y-8">
          <CommentOutlined className="text-6xl opacity-60" />

          <span className="text-center">
            Get started by selecting a page to collect comments from.
          </span>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              const control = modal({
                content: (
                  <StartCollectionDialog
                    onRequestClose={() => control.destroy()}
                  />
                ),
              })
            }}
          >
            Start collecting
          </Button>
        </div>
      </div>
    </main>
  )
}
