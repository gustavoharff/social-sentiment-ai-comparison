import classNames from 'classnames'
import { ComponentProps } from 'react'

export function CardBody(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={classNames('flex w-full flex-col', props.className)}
    />
  )
}
