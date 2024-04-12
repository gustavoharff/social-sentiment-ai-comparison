import axios from 'axios'

import { Comment, CommentsResponse } from '../../types/comment'

export class CommentsModule {
  private access_token: string

  constructor(access_token: string) {
    this.access_token = access_token
  }

  public async getComments(postId: string) {
    const comments: Comment[] = []

    async function get(url: string) {
      return axios.get<CommentsResponse>(url)
    }

    const searchParams = new URLSearchParams({
      access_token: this.access_token,
      order: 'chronological',
      filter: 'stream',
      fields: 'id,message,created_time',
    })

    const url = new URL('https://graph.facebook.com/' + postId + '/comments')
    url.search = searchParams.toString()

    console.log(url.toString())

    let response = await get(url.toString())

    comments.push(...response.data.data)

    while (response.data.paging?.next) {
      response = await get(response.data.paging.next)

      comments.push(...response.data.data)
    }

    return comments
  }
}
