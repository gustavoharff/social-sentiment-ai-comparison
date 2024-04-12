import { Pagination } from './pagination'

export interface Post {
  id: string
}

export interface PostsResponse extends Pagination<Post> {}

export interface PostResponse extends Post {}
