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
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import colors from 'tailwindcss/colors'

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
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
}

interface Item {
  date: string
  sentiment: Data2['sentiment']
  comments: number
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

        if (comment.sentiment === 'mixed') {
          acc.mixed += 1
        }

        return acc
      },
      { positive: 0, negative: 0, neutral: 0, mixed: 0 },
    )

    const total = counts.positive + counts.negative + counts.neutral

    const positivePercentage = (counts.positive / total) * 100
    const negativePercentage = (counts.negative / total) * 100
    const neutralPercentage = (counts.neutral / total) * 100
    const mixedPercentage = (counts.mixed / total) * 100

    return [
      {
        id: 'positive',
        name: 'Positivo',
        value: Number.isNaN(positivePercentage) ? 0 : positivePercentage,
      },
      {
        id: 'negative',
        name: 'Negativo',
        value: Number.isNaN(negativePercentage) ? 0 : negativePercentage,
      },
      {
        id: 'neutral',
        name: 'Neutro',
        value: Number.isNaN(neutralPercentage) ? 0 : neutralPercentage,
      },
      {
        id: 'mixed',
        name: 'Misto',
        value: Number.isNaN(mixedPercentage) ? 0 : mixedPercentage,
      },
    ]
  }, [comments])

  const perDayData = useMemo(() => {
    const positiveItems: Item[] = []
    const negativeItems: Item[] = []
    const neutralItems: Item[] = []
    const mixedItems: Item[] = []

    for (const comment of comments) {
      if (comment.sentiment === 'positive') {
        const date = positiveItems.find((c) => {
          return c.date === dayjs(comment.publishedAt).format('YYYY-MM-DD')
        })

        if (!date) {
          positiveItems.push({
            date: dayjs(comment.publishedAt).format('YYYY-MM-DD'),
            comments: 1,
            sentiment: 'positive',
          })
        } else {
          date.comments += 1
          positiveItems.slice(positiveItems.indexOf(date), 1)
          positiveItems.push(date)
        }
      }

      if (comment.sentiment === 'negative') {
        const date = negativeItems.find((c) => {
          return c.date === dayjs(comment.publishedAt).format('YYYY-MM-DD')
        })

        if (!date) {
          negativeItems.push({
            date: dayjs(comment.publishedAt).format('YYYY-MM-DD'),
            comments: 1,
            sentiment: 'negative',
          })
        } else {
          date.comments += 1
          negativeItems.slice(negativeItems.indexOf(date), 1)
          negativeItems.push(date)
        }
      }

      if (comment.sentiment === 'neutral') {
        const date = neutralItems.find((c) => {
          return c.date === dayjs(comment.publishedAt).format('YYYY-MM-DD')
        })

        if (!date) {
          neutralItems.push({
            date: dayjs(comment.publishedAt).format('YYYY-MM-DD'),
            comments: 1,
            sentiment: 'neutral',
          })
        } else {
          date.comments += 1
          neutralItems.slice(neutralItems.indexOf(date), 1)
          neutralItems.push(date)
        }
      }

      if (comment.sentiment === 'mixed') {
        const date = mixedItems.find((c) => {
          return c.date === dayjs(comment.publishedAt).format('YYYY-MM-DD')
        })

        if (!date) {
          mixedItems.push({
            date: dayjs(comment.publishedAt).format('YYYY-MM-DD'),
            comments: 1,
            sentiment: 'mixed',
          })
        } else {
          date.comments += 1
          mixedItems.slice(mixedItems.indexOf(date), 1)
          mixedItems.push(date)
        }
      }
    }

    return [...positiveItems, ...negativeItems, ...neutralItems, ...mixedItems]
  }, [comments])

  // const fake: Item[] = [
  //   {
  //     date: '2024-06-01',
  //     sentiment: 'positive',
  //     comments: 6,
  //   },
  //   {
  //     date: '2024-06-01',
  //     sentiment: 'negative',
  //     comments: 3,
  //   },
  //   {
  //     date: '2024-06-01',
  //     sentiment: 'neutral',
  //     comments: 2,
  //   },
  //   {
  //     date: '2024-06-02',
  //     sentiment: 'positive',
  //     comments: 10,
  //   },
  //   {
  //     date: '2024-06-02',
  //     sentiment: 'negative',
  //     comments: 4,
  //   },
  //   {
  //     date: '2024-06-02',
  //     sentiment: 'neutral',
  //     comments: 6,
  //   },
  //   {
  //     date: '2024-06-03',
  //     sentiment: 'positive',
  //     comments: 12,
  //   },
  //   {
  //     date: '2024-06-03',
  //     sentiment: 'negative',
  //     comments: 6,
  //   },
  //   {
  //     date: '2024-06-03',
  //     sentiment: 'neutral',
  //     comments: 6,
  //   },
  //   {
  //     date: '2024-06-04',
  //     sentiment: 'positive',
  //     comments: 19,
  //   },
  //   {
  //     date: '2024-06-04',
  //     sentiment: 'negative',
  //     comments: 7,
  //   },
  //   {
  //     date: '2024-06-04',
  //     sentiment: 'neutral',
  //     comments: 9,
  //   },
  //   {
  //     date: '2024-06-05',
  //     sentiment: 'positive',
  //     comments: 24,
  //   },
  //   {
  //     date: '2024-06-05',
  //     sentiment: 'negative',
  //     comments: 7,
  //   },
  //   {
  //     date: '2024-06-05',
  //     sentiment: 'neutral',
  //     comments: 11,
  //   },
  //   {
  //     date: '2024-06-06',
  //     sentiment: 'positive',
  //     comments: 34,
  //   },
  //   {
  //     date: '2024-06-06',
  //     sentiment: 'negative',
  //     comments: 8,
  //   },
  //   {
  //     date: '2024-06-06',
  //     sentiment: 'neutral',
  //     comments: 15,
  //   },
  // ]

  return (
    <Spin spinning={loading}>
      <div className="mx-auto mt-4 flex w-[calc(100%-4rem)] flex-col gap-4">
        <h1 className="text-2xl font-bold">Relatório</h1>

        <div className="flex justify-between">
          <div className="flex w-1/2 flex-col items-center gap-4">
            <h4 className="text-xl font-semibold">Sentimentos</h4>
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
                    text: comments.length + '\ncomentários',
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
          </div>

          <div className="flex w-1/2 flex-col items-center  gap-4">
            <h4 className="text-xl font-semibold">Comentários por dia</h4>

            <Line
              className="w-1/2"
              theme={resolvedTheme === 'dark' ? 'custom-dark' : 'light'}
              data={perDayData}
              meta={{
                comments: {
                  alias: 'Comentários',
                },
              }}
              padding="auto"
              xField="date"
              yField="comments"
              seriesField="sentiment"
              legend={{
                itemName: {
                  formatter: (text) => {
                    if (text === 'positive') {
                      return 'Positivo'
                    }

                    if (text === 'negative') {
                      return 'Negativo'
                    }

                    if (text === 'neutral') {
                      return 'Neutro'
                    }

                    if (text === 'mixed') {
                      return 'Misto'
                    }
                  },
                },
              }}
              tooltip={{
                title: (title) => {
                  return dayjs(title).format('DD/MM/YYYY')
                },
                formatter: (data) => {
                  return {
                    name: 'Comentários',
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
                  mixed: colors.yellow[500],
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
                    mixed: colors.yellow[500],
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
        </div>

        <Table
          className="my-4"
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
            align="center"
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

              if (sentiment === 'mixed') {
                return <span className="text-yellow-500">Mixed</span>
              }
            }}
          />

          <Table.Column<Comment>
            title="Cloud Natural Language"
            dataIndex="sentiments"
            width={200}
            align="center"
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
            width={150}
            align="center"
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
