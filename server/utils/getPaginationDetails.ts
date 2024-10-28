import type { Request } from 'express'
import { SortDirection } from '../@types/shared'
import { createQueryString } from './utils'

export const getPaginationDetails = <T>(
  request: Request,
  basePath: string,
  additionalParams: Record<string, unknown> = {},
  defaultSortBy: T = undefined,
) => {
  const pageNumber = request.query.page ? Number(request.query.page) : undefined
  const sortBy = (request.query.sortBy || defaultSortBy) as T
  const sortDirection = request.query.sortDirection as SortDirection

  const queryString = createQueryString({ ...additionalParams, sortBy, sortDirection }, { addQueryPrefix: true })
  const queryStringSuffix = queryString.length > 0 ? '&' : '?'
  const hrefPrefix = `${basePath}${queryString}${queryStringSuffix}`

  return { pageNumber, sortBy, sortDirection, hrefPrefix }
}
