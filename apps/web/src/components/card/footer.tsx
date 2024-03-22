import classNames from 'classnames'
import { ComponentProps } from 'react'

export function CardFooter(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={classNames(
        'border-t border-solid border-[#d7dbdf] dark:border-[#3a3f42]',
        'bg-[#f8f9fa] dark:bg-[#1a1d1e]',
        props.className,
      )}
    />
  )
}
