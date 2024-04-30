import axios from 'axios'
import dayjs from 'dayjs'

import { Post, PostsResponse } from '../../types/post'

export class PostsModule {
  private access_token: string

  constructor(access_token: string) {
    this.access_token = access_token
  }

  public async getPosts(pageId: string) {
    const posts: Post[] = []

    async function get(url: string) {
      return axios.get<PostsResponse>(url)
    }

    const searchParams = new URLSearchParams({
      access_token: this.access_token,
      order: 'chronological',
      since: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      fields: 'id,message',
    })

    const url = new URL('https://graph.facebook.com/' + pageId + '/posts')
    url.search = searchParams.toString()

    let response = await get(url.toString())

    posts.push(...response.data.data)

    while (response.data.paging?.next) {
      response = await get(response.data.paging.next)

      posts.push(...response.data.data)
    }

    return posts
  }
}
