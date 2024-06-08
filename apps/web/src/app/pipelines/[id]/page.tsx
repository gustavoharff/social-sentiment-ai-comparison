'use client'

import { LineChartOutlined } from '@ant-design/icons'
import { pipeline, task } from '@vizo/drizzle/schema'
import { Button } from 'antd'
import axios from 'axios'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Section } from '@/components/section'

type Pipeline = typeof pipeline.$inferSelect & {
  tasks: (typeof task.$inferSelect)[]
}

export default function Pipeline() {
  const { id } = useParams()

  const [pipeline, setPipeline] = useState<Pipeline | null>(null)

  useEffect(() => {
    axios.get('/api/pipelines/' + id).then((response) => {
      setPipeline(response.data)
    })
  }, [id])

  if (!pipeline) {
    return null
  }

  return (
    <div className="mx-auto mt-4 flex w-[calc(100%-4rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipeline</h1>

        <Link href={`/pipelines/${id}/report`}>
          <Button type="primary" className="mt-4" icon={<LineChartOutlined />}>
            Visualizar relatório
          </Button>
        </Link>
      </div>

      {pipeline.tasks.map((task) => (
        <Section
          key={task.id}
          id={task.id}
          fileUrl={task.fileUrl!}
          name={task.name}
          status={task.status}
          title={task.name}
          startedAt={task.startedAt}
          finishedAt={task.finishedAt}
        />
      ))}
    </div>
  )
}
