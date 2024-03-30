'use client'

import { pipeline, task } from '@vizo/drizzle/schema'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Section } from '@/components/section'

type Pipeline = typeof pipeline.$inferSelect & {
  tasks: (typeof task.$inferSelect)[]
}

export default function Pepeline() {
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
      <h1 className="text-2xl font-bold">Pipeline</h1>

      {pipeline.tasks.map((task) => (
        <Section
          key={task.id}
          id={task.id}
          lines={[]}
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
