import classNames from 'classnames'
import { CSSProperties, ReactNode } from 'react'

import { CardBody } from './body'
import { CardFooter } from './footer'
import { CardHeader } from './header'

interface CardProps {
  className?: string
  children: ReactNode
  style?: CSSProperties
}

export function Card({ children, style = {}, className }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white dark:bg-[#151718]',
        'rounded-md',
        'border border-solid border-[#d7dbdf] dark:border-[#3a3f42]',
        'overflow-hidden',
        className,
      )}
      style={{
        ...style,
      }}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
