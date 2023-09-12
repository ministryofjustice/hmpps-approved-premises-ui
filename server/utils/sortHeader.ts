import qs from 'qs'
import { SortDirection } from '../@types/shared'
import { TableCell } from '../@types/ui'
import { createQueryString } from './utils'

export const sortHeader = (
  text: string,
  targetField: string,
  currentSortField: string,
  currentSortDirection: SortDirection,
  hrefPrefix: string,
): TableCell => {
  let sortDirection: SortDirection
  let ariaSort = 'none'

  const [basePath, queryString] = hrefPrefix.split('?')
  const qsArgs = qs.parse(queryString)

  if (targetField === currentSortField) {
    if (currentSortDirection === 'desc') {
      sortDirection = 'asc'
      ariaSort = 'descending'
    } else {
      sortDirection = 'desc'
      ariaSort = 'ascending'
    }
  }

  return {
    html: `<a href="${basePath}?${createQueryString({ ...qsArgs, sortBy: targetField, sortDirection })}">${text}</a>`,
    attributes: {
      'aria-sort': ariaSort,
      'data-cy-sort-field': targetField,
    },
  }
}
