'use client'

import { Pie } from '@ant-design/charts'
import { comment } from '@vizo/drizzle/schema'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import colors from 'tailwindcss/colors'

type Comment = typeof comment.$inferSelect

export default function Report() {
  const { id } = useParams()

  const { resolvedTheme } = useTheme()

  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    axios.get('/api/pipelines/' + id + '/comments').then((response) => {
      setComments(response.data)
    })
  }, [id])

  const data = useMemo(() => {
    const counts = comments.reduce(
      (acc, comment) => {
        if (comment.sentiment === 'positive') {
          acc.positive += 1
        }

        if (comment.sentiment === 'negative') {
          acc.negative += 1
        }

        if (comment.sentiment === 'neutral') {
          acc.neutral += 1
        }

        return acc
      },
      { positive: 0, negative: 0, neutral: 0 },
    )

    const total = counts.positive + counts.negative + counts.neutral

    return [
      {
        id: 'positive',
        name: 'Positive',
        value: (counts.positive / total) * 100,
      },
      {
        id: 'negative',
        name: 'Negative',
        value: (counts.negative / total) * 100,
      },
      {
        id: 'neutral',
        name: 'Neutral',
        value: (counts.neutral / total) * 100,
      },
    ]
  }, [comments])

  return (
    <div className="mx-auto mt-4 flex w-[calc(100%-4rem)] flex-col gap-4">
      <h1 className="text-2xl font-bold">Report</h1>

      <Pie
        className="max-h-96 max-w-96"
        animate={false}
        angleField="value"
        colorField="color"
        legend={false}
        tooltip={false}
        data={data}
        innerRadius={0.6}
        style={{
          lineWidth: 3,
          stroke: (data) => {
            const tone = resolvedTheme === 'dark' ? 800 : 200

            if (data.id === 'positive') {
              return colors.green[tone]
            }

            if (data.id === 'negative') {
              return colors.red[tone]
            }

            if (data.id === 'neutral') {
              return colors.gray[tone]
            }
          },
          inset: 2,
          radius: 10,
          fill: (data) => {
            const tone = resolvedTheme === 'dark' ? 400 : 600

            if (data.id === 'positive') {
              return colors.green[tone]
            }

            if (data.id === 'negative') {
              return colors.red[tone]
            }

            if (data.id === 'neutral') {
              return colors.gray[tone]
            }
          },
        }}
        label={{
          text: (data) => {
            const percentage = data.value.toFixed(0) + '%'

            return data.name + '\n' + percentage
          },
          style: {
            fontSize: 14,
            fontWeight: '600',
          },
          fill: (data) => {
            const tone = resolvedTheme === 'dark' ? 800 : 200

            if (data.id === 'positive') {
              return colors.green[tone]
            }

            if (data.id === 'negative') {
              return colors.red[tone]
            }

            if (data.id === 'neutral') {
              return colors.gray[tone]
            }
          },
        }}
        annotations={[
          {
            type: 'text',
            tooltip: false,
            style: {
              text: '120\ncomments',
              x: '50%',
              y: '50%',
              textAlign: 'center',
              fontStyle: 'bold',
              fontSize: 24,
              fill: resolvedTheme === 'dark' ? 'white' : 'black',
            },
          },
        ]}
      />

      {/* <Chart
        type="donut"
        // width="100%"
        // height={76}
        series={[50, 50]}
        options={{
          theme: {
            mode: resolvedTheme === 'dark' ? 'dark' : 'light',
          },
          labels: ['Positive', 'Negative'],
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  total: {
                    show: true,
                    formatter: () => '120 comentários',
                    fontWeight: 'bold',
                  },
                  value: {
                    show: false,
                  },
                },
              },
            },
          },
          tooltip: {
            enabled: false,
          },
          legend: {
            show: false,
          },
          stroke: {
            dashArray: 4,
            curve: 'straight',
            width: 10,
            lineCap: 'butt',
          },
          colors: [emerald[500], rose[500]],
          // series: [44, 55, 41, 17, 15],
          // chart: {
          // type: 'donut',
          // },
        }}
      /> */}
    </div>
  )
}
