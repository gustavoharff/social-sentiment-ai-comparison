import { Pagination } from './pagination'

export interface Comment {
  id: string
  message: string
  created_time: string
}

export interface CommentsResponse extends Pagination<Comment> {}

export interface CommentResponse extends Comment {}
