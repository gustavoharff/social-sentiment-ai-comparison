import { Pagination } from './pagination'

export interface Page {
  id: string
  name: string
  access_token: string
}

export interface SecuredPage extends Omit<Page, 'access_token'> {}

export interface PagesResponse extends Pagination<Page> {}

export interface PageResponse extends Page {}
