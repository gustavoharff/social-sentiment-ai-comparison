'use client'

import { Pie } from '@ant-design/charts'
import { comment } from '@vizo/drizzle/schema'
import { Table } from 'antd'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import colors from 'tailwindcss/colors'

type Comment = typeof comment.$inferSelect

type Data = {
  id: string
  name: string
  value: number
}

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

    const positivePercentage = (counts.positive / total) * 100
    const negativePercentage = (counts.negative / total) * 100
    const neutralPercentage = (counts.neutral / total) * 100

    return [
      {
        id: 'positive',
        name: 'Positive',
        value: Number.isNaN(positivePercentage) ? 0 : positivePercentage,
      },
      {
        id: 'negative',
        name: 'Negative',
        value: Number.isNaN(negativePercentage) ? 0 : negativePercentage,
      },
      {
        id: 'neutral',
        name: 'Neutral',
        value: Number.isNaN(neutralPercentage) ? 0 : neutralPercentage,
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
          stroke: (data: Data) => {
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
          fill: (data: Data) => {
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
          text: (data: Data) => {
            const percentage = data.value.toFixed(0) + '%'

            if (percentage === '0%') {
              return ''
            }

            return data.name + '\n' + percentage
          },
          style: {
            fontSize: 14,
            fontWeight: '600',
          },
          fill: (data: Data) => {
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
              text: comments.length + '\ncomments',
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

      <Table dataSource={comments} rowKey="id" pagination={false}>
        <Table.Column<Comment> title="Comment" dataIndex="message" key="text" />

        <Table.Column<Comment>
          title="Comprehend"
          dataIndex="sentiments"
          key="aws-sentiment"
          render={(value) => {
            const sentiment = value.find(
              (sentiment: any) => sentiment.provider === 'aws',
            )?.sentiment

            if (sentiment === 'positive') {
              return <span className="text-green-500">Positive</span>
            }

            if (sentiment === 'negative') {
              return <span className="text-red-500">Negative</span>
            }

            if (sentiment === 'neutral') {
              return <span className="text-gray-500">Neutral</span>
            }
          }}
        />

        <Table.Column<Comment>
          title="Cloud Natural Language"
          dataIndex="sentiments"
          key="google-sentiment"
          render={(value) => {
            const sentiment = value.find(
              (sentiment: any) => sentiment.provider === 'google',
            )?.sentiment

            if (sentiment === 'positive') {
              return <span className="text-green-500">Positive</span>
            }

            if (sentiment === 'negative') {
              return <span className="text-red-500">Negative</span>
            }

            if (sentiment === 'neutral') {
              return <span className="text-gray-500">Neutral</span>
            }

            if (sentiment === 'mixed') {
              return <span className="text-yellow-500">Mixed</span>
            }
          }}
        />

        <Table.Column<Comment>
          title="Text Analytics"
          dataIndex="sentiments"
          key="azure-sentiment"
          render={(value) => {
            const sentiment = value.find(
              (sentiment: any) => sentiment.provider === 'azure',
            )?.sentiment

            if (sentiment === 'positive') {
              return <span className="text-green-500">Positive</span>
            }

            if (sentiment === 'negative') {
              return <span className="text-red-500">Negative</span>
            }

            if (sentiment === 'neutral') {
              return <span className="text-gray-500">Neutral</span>
            }

            if (sentiment === 'mixed') {
              return <span className="text-yellow-500">Mixed</span>
            }
          }}
        />

        <Table.Column<Comment>
          title="Sentiment"
          dataIndex="sentiment"
          key="sentiment"
          render={(sentiment) => {
            if (sentiment === 'positive') {
              return <span className="text-green-500">Positive</span>
            }

            if (sentiment === 'negative') {
              return <span className="text-red-500">Negative</span>
            }

            if (sentiment === 'neutral') {
              return <span className="text-gray-500">Neutral</span>
            }

            if (sentiment === 'mixed') {
              return <span className="text-yellow-500">Mixed</span>
            }
          }}
        />
      </Table>
    </div>
  )
}
