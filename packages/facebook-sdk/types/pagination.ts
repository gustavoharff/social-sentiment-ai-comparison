export interface Pagination<T> {
  data: T[]
  paging: {
    cursors: {
      before: string
      after: string
    }
    next: string
    previous: string
  }
}
