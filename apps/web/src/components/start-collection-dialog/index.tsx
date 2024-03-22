'use client'

import { CloseOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Form, Select } from 'antd'
import axios from 'axios'
import { useSession } from 'next-auth/react'
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
  onRequestClose: () => void
}

export function StartCollectionDialog(props: StartCollectionDialogProps) {
  const { onRequestClose } = props

  const [pages, setPages] = useState<Page[]>([])

  const session = useSession()

  useEffect(() => {
    const fetchPages = async () => {
      const response = await axios.get<PagesResponse>(
        'https://graph.facebook.com/me/accounts',
        {
          params: {
            access_token: session.data?.user.accessToken,
          },
        },
      )
      setPages(response.data.data)
    }

    fetchPages()
  }, [])

  return (
    <Card>
      <Card.Header title="Start Collection" icon={<PlayCircleOutlined />}>
        <Button type="text" icon={<CloseOutlined />} onClick={onRequestClose} />
      </Card.Header>

      <Card.Body>
        <Form>
          <div className="flex flex-col px-6 pt-4">
            <Form.Item label="Page">
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
