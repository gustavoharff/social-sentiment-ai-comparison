'use client'

import dayjs from 'dayjs'
import ms from 'pretty-ms'
import { ComponentProps, useEffect, useState } from 'react'

interface TimeProps extends ComponentProps<'div'> {
  startedAt?: Date | null
  finishedAt?: Date | null
}

export function Time(props: TimeProps) {
  const { startedAt, finishedAt, ...rest } = props

  const [diff, setDiff] = useState(
    dayjs(finishedAt || dayjs()).diff(dayjs(startedAt), 'milliseconds'),
  )

  useEffect(() => {
    /* eslint-disable-next-line no-undef */
    let interval: NodeJS.Timeout | null = null

    if (!startedAt) {
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }

    if (finishedAt) {
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }

    setDiff(dayjs().diff(dayjs(startedAt), 'milliseconds'))

    interval = setInterval(() => {
      setDiff(dayjs().diff(dayjs(startedAt), 'milliseconds'))
    }, 500)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [finishedAt, startedAt])

  const output = (() => {
    if (!startedAt) {
      return '-'
    }

    if (finishedAt) {
      const diff = dayjs(finishedAt).diff(dayjs(startedAt), 'milliseconds')
      const value = ms(diff < 1000 ? 1000 : diff, {
        secondsDecimalDigits: 0,
        millisecondsDecimalDigits: 0,
        unitCount: diff < 1000 ? 1 : 2,
      })

      return value
    }

    if (!diff) {
      return '-'
    }

    const value = ms(diff < 1000 ? 1000 : diff, {
      secondsDecimalDigits: 0,
      millisecondsDecimalDigits: 0,
      unitCount: diff < 1000 ? 1 : 2,
    })

    return value
  })()

  return (
    <div suppressHydrationWarning {...rest} className="font-mono">
      {output}
    </div>
  )
}
