'use client'

import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CommentOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { pipeline, task } from '@vizo/drizzle/schema'
import { Button } from 'antd'
import axios from 'axios'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { green, red, yellow } from 'tailwindcss/colors'

import { StartCollectionDialog } from '@/components/start-collection-dialog'
import { useCustomModal } from '@/hooks/use-custom-modal'

dayjs.extend(relativeTime)

type Pipeline = typeof pipeline.$inferSelect & {
  tasks: (typeof task.$inferSelect)[]
}

export default function Home() {
  const modal = useCustomModal()

  const { data } = useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const response = await axios.get<Pipeline[]>('/api/pipelines')

      return response.data
    },
  })

  return (
    <div className="p-4">
      <div className="">
        <span className="text-lg font-semibold">Análises recentes</span>

        {data?.length === 0 && (
          <span className="text-sm text-gray-400">Sem análises recentes</span>
        )}

        <div className="mt-2 max-w-72">
          {data?.map((pipeline) => {
            const isRunning = pipeline.tasks.some(
              (task) => task.status === 'running',
            )

            const isCompleted = pipeline.tasks.every(
              (task) => task.status === 'completed',
            )
            const isFailed = pipeline.tasks.some(
              (task) => task.status === 'failed',
            )

            return (
              <div
                key={pipeline.id}
                className={classNames(
                  'flex items-center gap-2 p-2',
                  'border-t border-solid border-[var(--default-border)]',
                )}
              >
                {isRunning ? (
                  <SettingOutlined
                    className="animate-spin text-base duration-700"
                    style={{ animationDuration: '2s' }}
                  />
                ) : isFailed ? (
                  <CloseCircleFilled
                    className="text-base"
                    style={{ color: red[500] }}
                  />
                ) : isCompleted ? (
                  <CheckCircleFilled
                    className="text-base"
                    style={{ color: green[500] }}
                  />
                ) : (
                  <ClockCircleOutlined
                    className="text-base"
                    style={{ color: yellow[500] }}
                  />
                )}

                <span>{pipeline.title}</span>

                <div className="ml-auto flex items-center gap-2">
                  <span className="opacity-80">
                    {dayjs(pipeline.createdAt).fromNow()}
                  </span>

                  <Link href={`/pipelines/${pipeline.id}`}>
                    <Button type="text" icon={<ArrowRightOutlined />} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-grow flex-col items-center justify-center">
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
      </div>
    </div>
  )
}
