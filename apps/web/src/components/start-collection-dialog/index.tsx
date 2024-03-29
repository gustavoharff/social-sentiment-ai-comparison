'use client'

import { CloseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Form, Select } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'

import { Card } from '../card'

interface Page {
  id: string
  name: string
}

interface PagesResponse {
  data: Page[]
}

interface StartCollectionDialogProps {
  onPick: (page: Page) => void
  onRequestClose: () => void
}

interface FormValues {
  page: string
}

export function StartCollectionDialog(props: StartCollectionDialogProps) {
  const { onPick, onRequestClose } = props

  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    const fetchPages = async () => {
      const response = await axios.get<PagesResponse>('/api/pages')
      setPages(response.data.data)
    }

    fetchPages()
  }, [])

  function onFinish(values: FormValues) {
    const page = pages.find((page) => page.id === values.page)

    if (page) {
      onPick(page)

      onRequestClose()
    }
  }

  return (
    <Card>
      <Card.Header title="Start Collection" icon={<PlayCircleOutlined />}>
        <Button type="text" icon={<CloseOutlined />} onClick={onRequestClose} />
      </Card.Header>

      <Card.Body>
        <Form onFinish={onFinish}>
          <div className="flex flex-col px-6 pt-4">
            <span className="mb-4">
              Select a page to start collecting comments from.
            </span>

            <Form.Item
              label="Page"
              name="page"
              required
              rules={[{ required: true }]}
            >
              <Select>
                {pages.map((page) => {
                  return (
                    <Select.Option key={page.id} value={page.id}>
                      {page.name}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
          </div>

          <Card.Footer className="p-4">
            <div className="flex w-full items-center justify-end gap-2">
              <Button type="text" onClick={onRequestClose}>
                Cancel
              </Button>

              <Button type="primary" htmlType="submit">
                Start Collection
              </Button>
            </div>
          </Card.Footer>
        </Form>
      </Card.Body>
    </Card>
  )
}
