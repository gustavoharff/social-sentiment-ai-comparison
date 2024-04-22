'use client'

import { Radio } from 'antd'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Radio.Group
      value={resolvedTheme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <Radio.Button value="light">Light</Radio.Button>
      <Radio.Button value="dark">Dark</Radio.Button>
    </Radio.Group>
  )
}
