import { CommentsModule } from './modules/comments'
import { PagesModule } from './modules/pages'
import { PostsModule } from './modules/posts'

export class FacebookSDK {
  private access_token: string

  constructor(access_token: string) {
    this.access_token = access_token
  }

  public pages() {
    return new PagesModule(this.access_token)
  }

  public posts() {
    return new PostsModule(this.access_token)
  }

  public comments() {
    return new CommentsModule(this.access_token)
  }
}
