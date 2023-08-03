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
    html: `<a href="${hrefPrefix}${createQueryString({ sortBy: targetField, sortDirection })}">${text}</a>`,
    attributes: {
      'aria-sort': ariaSort,
      'data-cy-sort-field': targetField,
    },
  }
}
