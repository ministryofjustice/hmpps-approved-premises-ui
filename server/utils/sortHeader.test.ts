import { sortHeader } from './sortHeader'
import { createQueryString } from './utils'

describe('sortHeader', () => {
  const hrefPrefix = 'http://localhost/example?'

  it("should return a header when the current view is not sorted by the header's field`", () => {
    expect(sortHeader('Some text', 'myField', 'otherField', 'asc', hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({ sortBy: 'myField' })}">Some text</a>`,
      attributes: {
        'aria-sort': 'none',
      },
    })
  })

  it("should return a header when the current view is sorted in ascending order by the header's field`", () => {
    expect(sortHeader('Some text', 'myField', 'myField', 'asc', hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({ sortBy: 'myField', sortDirection: 'desc' })}">Some text</a>`,
      attributes: {
        'aria-sort': 'ascending',
      },
    })
  })

  it("should return a header when the current view is sorted in descending order by the header's field`", () => {
    expect(sortHeader('Some text', 'myField', 'myField', 'desc', hrefPrefix)).toEqual({
      html: `<a href="${hrefPrefix}${createQueryString({ sortBy: 'myField', sortDirection: 'asc' })}">Some text</a>`,
      attributes: {
        'aria-sort': 'descending',
      },
    })
  })
})
