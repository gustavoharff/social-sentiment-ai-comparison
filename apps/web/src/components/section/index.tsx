'use client'

import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  DownOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { green, red, yellow } from 'tailwindcss/colors'

import { Time } from './time'

interface SectionProps {
  id: string
  name: string
  title: string
  fileUrl: string
  startedAt?: Date | null
  finishedAt?: Date | null
  status: 'pending' | 'running' | 'completed' | 'failed'
}

type Line = {
  type: 'text'
  content: string
}

export function Section(props: SectionProps) {
  const {
    status: initialStatus,
    title,
    fileUrl,
    startedAt: initialStartedAt,
    finishedAt: initialFinishedAt,
  } = props

  const [status, setStatus] = useState(initialStatus)
  const [startedAt, setStartedAt] = useState(initialStartedAt)
  const [finishedAt, setFinishedAt] = useState(initialFinishedAt)

  const [lines, setLines] = useState<Line[]>([])

  const [isCollapsed, setIsCollapsed] = useState(status !== 'running')

  const jobStatusIcon = {
    pending: (
      <ClockCircleOutlined
        className="text-base"
        style={{ color: yellow[500] }}
      />
    ),
    running: (
      <SettingOutlined
        className="animate-spin text-base duration-700"
        style={{ animationDuration: '2s' }}
      />
    ),
    completed: (
      <CheckCircleFilled className="text-base" style={{ color: green[500] }} />
    ),
    failed: (
      <CloseCircleFilled className="text-base" style={{ color: red[500] }} />
    ),
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const fetchLogs = async () => {
      const response = await axios.get(fileUrl)

      setLines(response.data)
    }

    if (status === 'completed' || status === 'failed') {
      fetchLogs()

      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }

    interval = setInterval(fetchLogs, 2000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [fileUrl, status])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const fetchTask = async () => {
      const response = await axios.get('/api/tasks/' + props.id)

      setStartedAt(response.data.startedAt)
      setFinishedAt(response.data.finishedAt)
      setStatus(response.data.status)

      if (
        status !== response.data.status &&
        response.data.status === 'running'
      ) {
        setIsCollapsed(false)
      }

      if (
        status !== response.data.status &&
        response.data.status === 'completed'
      ) {
        setIsCollapsed(true)
      }
    }

    if (status === 'completed' || status === 'failed') {
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }

    interval = setInterval(fetchTask, 2000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [props.id, status])

  function renderLine(line: string, index: number) {
    const hasAnsi = line.includes('\\u001b')

    if (hasAnsi) {
      const parts = line.split('\\u001b')

      return (
        <span
          key={line + index}
          className="flex pr-4 font-normal leading-[1.6154] tracking-[-.003rem] hover:bg-[#eae7e7] hover:dark:bg-[#1d1d1d]"
        >
          <span className="mr-4 min-w-14 select-none text-right text-[#697177]">
            {index + 1}
          </span>
          <code>
            {parts.map((part) => {
              const code = part.split('m', 1)[0] + 'm'
              const [, ...rest] = part.split('m')
              const log = rest.join('m')

              if (code === '[0m') {
                return <span key={part}>{log}</span>
              }

              if (code === '[31m') {
                return (
                  <span key={part} className="text-red-500">
                    {log}
                  </span>
                )
              }

              if (code === '[32m') {
                return (
                  <span key={part} className="text-green-500">
                    {log}
                  </span>
                )
              }

              if (code === '[33m') {
                return (
                  <span key={part} className="text-yellow-500">
                    {log}
                  </span>
                )
              }

              if (code === '[34m') {
                return (
                  <span key={part} className="text-blue-500">
                    {log}
                  </span>
                )
              }

              if (code === '[35m') {
                return (
                  <span key={part} className="text-purple-500">
                    {log}
                  </span>
                )
              }

              if (code === '[36m') {
                return (
                  <span key={part} className="text-cyan-500">
                    {log}
                  </span>
                )
              }

              if (code === '[37m') {
                return (
                  <span key={part} className="text-gray-500">
                    {log}
                  </span>
                )
              }

              return <span key={part}>{part}</span>
            })}
          </code>
        </span>
      )
    }

    return (
      <span
        key={line + index}
        className="flex pr-4 font-normal leading-[1.6154] tracking-[-.003rem] hover:bg-[#eae7e7] hover:dark:bg-[#1d1d1d]"
      >
        <span className="mr-4 min-w-14 select-none text-right text-[#697177]">
          {index + 1}
        </span>
        <code>{line}</code>
      </span>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-solid border-[var(--default-border)]">
      <div
        className={classNames(
          'flex cursor-pointer items-center gap-3 bg-[#f8f9fa] p-4 dark:bg-[#1a1d1e]',
          {
            'border-b border-solid border-[var(--default-border)]':
              !isCollapsed,
          },
        )}
        onClick={() => setIsCollapsed((state) => !state)}
      >
        {isCollapsed ? <RightOutlined /> : <DownOutlined />}

        <div className="flex items-center gap-2">
          {jobStatusIcon[status]}

          <div>{title}</div>
        </div>

        {startedAt && (
          <div className="ml-auto flex items-center gap-2">
            <ClockCircleOutlined className="opacity-60" />

            <Time
              className="opacity-80"
              startedAt={startedAt}
              finishedAt={finishedAt}
            />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <pre className="mb-0 whitespace-pre-wrap break-all py-4">
          {lines.map((line, index) => renderLine(line.content, index))}

          {status === 'running' && (
            <span className="flex pr-4 font-normal leading-[1.6154] tracking-[-.003rem] hover:bg-[#eae7e7] hover:dark:bg-[#1d1d1d]">
              <span className="mr-4 min-w-14 select-none text-right text-[#697177]">
                {lines.length + 1}
              </span>
              <code>...</code>
            </span>
          )}
        </pre>
      )}
    </div>
  )
}
