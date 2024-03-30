import { PagesModule } from './modules/pages'

export class FacebookSDK {
  private access_token: string

  constructor(access_token: string) {
    this.access_token = access_token
  }

  public pages() {
    return new PagesModule(this.access_token)
  }
}
