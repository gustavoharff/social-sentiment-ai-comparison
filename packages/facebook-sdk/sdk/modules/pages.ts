import axios from 'axios'

import { PageResponse, PagesResponse } from '../../types/page'

export class PagesModule {
  private access_token: string

  constructor(access_token: string) {
    this.access_token = access_token
  }

  public async getPages() {
    const response = await axios.get<PagesResponse>(
      'https://graph.facebook.com/me/accounts',
      {
        params: {
          access_token: this.access_token,
        },
      },
    )

    return response.data
  }

  public async getPage(page_id: string) {
    const response = await axios.get<PageResponse>(
      `https://graph.facebook.com/${page_id}`,
      {
        params: {
          fields: 'id,name,access_token',
          access_token: this.access_token,
        },
      },
    )

    return response.data
  }
}
