'use client'

import { Pie } from '@ant-design/charts'
import { G2, Line } from '@ant-design/plots'
import { comment, commentSentiment } from '@vizo/drizzle/schema'
import { Spin, Table } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import colors from 'tailwindcss/colors'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(utc)

const dark = G2.getTheme('dark')

dark.geometries.interval.rect.active.style.stroke = '#151718'

G2.registerTheme('custom-dark', {
  ...dark,
  background: 'transparent',
})

type Comment = typeof comment.$inferSelect & {
  sentiments: (typeof commentSentiment.$inferSelect)[]
}

type Data = {
  id: string
  name: string
  value: number
}

type Data2 = {
  date: string
  comments: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

export default function Report() {
  const { id } = useParams()

  const { resolvedTheme } = useTheme()

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/pipelines/' + id + '/comments')
      .then((response) => {
        setComments(response.data)
      })
      .finally(() => setLoading(false))
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
    <Spin spinning={loading}>
      <div className="mx-auto mt-4 flex w-[calc(100%-4rem)] flex-col gap-4">
        <h1 className="text-2xl font-bold">Report</h1>

        <div className="flex justify-between">
          <Pie
            className="max-h-96 w-1/2"
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

          <Line
            className="w-1/2"
            theme={resolvedTheme === 'dark' ? 'custom-dark' : 'light'}
            data={[
              {
                date: '2021-01-01',
                comments: 5,
                sentiment: 'positive',
              },
              {
                date: '2021-01-01',
                comments: 2,
                sentiment: 'negative',
              },
              {
                date: '2021-01-01',
                comments: 0,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-02',
                comments: 12,
                sentiment: 'positive',
              },
              {
                date: '2021-01-02',
                comments: 8,
                sentiment: 'negative',
              },
              {
                date: '2021-01-02',
                comments: 5,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-03',
                comments: 20,
                sentiment: 'positive',
              },
              {
                date: '2021-01-03',
                comments: 10,
                sentiment: 'negative',
              },
              {
                date: '2021-01-03',
                comments: 7,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-04',
                comments: 32,
                sentiment: 'positive',
              },
              {
                date: '2021-01-04',
                comments: 15,
                sentiment: 'negative',
              },
              {
                date: '2021-01-04',
                comments: 10,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-05',
                comments: 40,
                sentiment: 'positive',
              },
              {
                date: '2021-01-05',
                comments: 20,
                sentiment: 'negative',
              },
              {
                date: '2021-01-05',
                comments: 15,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-06',
                comments: 50,
                sentiment: 'positive',
              },
              {
                date: '2021-01-06',
                comments: 20,
                sentiment: 'negative',
              },
              {
                date: '2021-01-06',
                comments: 25,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-07',
                comments: 60,
                sentiment: 'positive',
              },
              {
                date: '2021-01-07',
                comments: 25,
                sentiment: 'negative',
              },
              {
                date: '2021-01-07',
                comments: 35,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-08',
                comments: 70,
                sentiment: 'positive',
              },
              {
                date: '2021-01-08',
                comments: 30,
                sentiment: 'negative',
              },
              {
                date: '2021-01-08',
                comments: 40,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-09',
                comments: 80,
                sentiment: 'positive',
              },
              {
                date: '2021-01-09',
                comments: 40,
                sentiment: 'negative',
              },
              {
                date: '2021-01-09',
                comments: 50,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-10',
                comments: 90,
                sentiment: 'positive',
              },
              {
                date: '2021-01-10',
                comments: 50,
                sentiment: 'negative',
              },
              {
                date: '2021-01-10',
                comments: 60,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-11',
                comments: 100,
                sentiment: 'positive',
              },
              {
                date: '2021-01-11',
                comments: 60,
                sentiment: 'negative',
              },
              {
                date: '2021-01-11',
                comments: 70,
                sentiment: 'neutral',
              },
              {
                date: '2021-01-12',
                comments: 110,
                sentiment: 'positive',
              },
              {
                date: '2021-01-12',
                comments: 70,
                sentiment: 'negative',
              },
              {
                date: '2021-01-12',
                comments: 80,
                sentiment: 'neutral',
              },
            ]}
            meta={{
              comments: {
                alias: 'Comments',
              },
            }}
            padding="auto"
            xField="date"
            yField="comments"
            seriesField="sentiment"
            // yAxis={{
            //   max: monitor.owner.license.maxCommentsPerMonthPerMonitoring
            //     ? monitor.owner.license.maxCommentsPerMonthPerMonitoring * 1.1
            //     : undefined,
            // }}
            tooltip={{
              title: (title) => {
                console.log(title)
                return dayjs(title).format('DD/MM/YYYY')
              },
              formatter: (data) => {
                return {
                  name: 'Comments',
                  value: data.comments,
                }
              },
            }}
            xAxis={{
              label: {
                formatter: (v) => {
                  return dayjs(v).format('DD/MM')
                },
              },
              grid: {
                line: {
                  style: {
                    stroke:
                      resolvedTheme === 'dark'
                        ? colors.zinc[800]
                        : colors.zinc[200],
                  },
                },
                alternateColor: 'rgba(0,0,0,0.05)',
              },
            }}
            color={(datum) => {
              const color = {
                positive: colors.green[500],
                negative: colors.red[500],
                neutral: colors.gray[500],
              }

              return color[datum.sentiment as unknown as Data2['sentiment']]
            }}
            point={{
              size: 4,
              color: colors.green[500],
              shape: 'circle',
              style: ({ sentiment }: Data2) => {
                const color = {
                  positive: colors.green[500],
                  negative: colors.red[500],
                  neutral: colors.gray[500],
                }

                return {
                  fill: color[sentiment],
                  stroke: color[sentiment],
                  lineWidth: 1,
                }
              },
            }}
            annotations={[]}
            smooth
          />
        </div>

        <Table
          className="mt-4"
          dataSource={comments}
          rowKey="id"
          pagination={false}
        >
          <Table.Column<Comment>
            title="Comment"
            dataIndex="message"
            key="text"
          />

          <Table.Column<Comment>
            title="Comprehend"
            dataIndex="sentiments"
            key="aws-sentiment"
            render={(value: Comment['sentiments']) => {
              const sentiment = value.find(
                (sentiment) => sentiment.provider === 'aws',
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
            render={(value: Comment['sentiments']) => {
              const sentiment = value.find(
                (sentiment) => sentiment.provider === 'google',
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
            render={(value: Comment['sentiments']) => {
              const sentiment = value.find(
                (sentiment) => sentiment.provider === 'azure',
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
    </Spin>
  )
}
