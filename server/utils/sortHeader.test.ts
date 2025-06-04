import { sortHeader } from './sortHeader'
import { createQueryString } from './utils'

type SortHeaders = 'myField' | 'otherField'

describe('sortHeader', () => {
  const hrefPrefix = 'http://localhost/example?'

  it("should return a header when the current view is not sorted by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'otherField', 'asc', hrefPrefix)).toEqual({
      html: `<a role="button" href="${hrefPrefix}${createQueryString({ sortBy: 'myField' })}">Some text</a>`,
      attributes: {
        'aria-sort': 'none',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it("should return a header when the current view is sorted in ascending order by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', 'asc', hrefPrefix)).toEqual({
      html: `<a role="button" href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'desc',
      })}">Some text</a>`,
      attributes: {
        'aria-sort': 'ascending',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it("should return a header when the current view is sorted in descending order by the header's field`", () => {
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', 'desc', hrefPrefix)).toEqual({
      html: `<a role="button" href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'asc',
      })}">Some text</a>`,
      attributes: {
        'aria-sort': 'descending',
        'data-cy-sort-field': 'myField',
      },
    })
  })

  it('should override and replace the existing parameters in the hrefPrefix', () => {
    const prefixWithParams = `${hrefPrefix}?sortBy=myField&sortDirection=desc`
    expect(sortHeader<SortHeaders>('Some text', 'myField', 'myField', 'desc', prefixWithParams)).toEqual({
      html: `<a role="button" href="${hrefPrefix}${createQueryString({
        sortBy: 'myField',
        sortDirection: 'asc',
      })}">Some text</a>`,
      attributes: {
        'aria-sort': 'descending',
        'data-cy-sort-field': 'myField',
      },
    })
  })
})
