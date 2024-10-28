import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import { getPaginationDetails } from './getPaginationDetails'

describe('getPaginationDetails', () => {
  const hrefPrefix = 'http://localhost/example'

  it('should return the hrefPrefix with a query string prefix if there are no query parameters', () => {
    const request = createMock<Request>({})

    expect(getPaginationDetails(request, hrefPrefix)).toEqual({
      pageNumber: undefined,
      sortBy: undefined,
      sortDirection: undefined,
      hrefPrefix: `${hrefPrefix}?`,
    })
  })

  it('should fetch the pagination query string options and append them to the hrefPrefix', () => {
    const request = createMock<Request>({ query: { page: '1', sortBy: 'something', sortDirection: 'asc' } })

    expect(getPaginationDetails(request, hrefPrefix)).toEqual({
      pageNumber: 1,
      sortBy: 'something',
      sortDirection: 'asc',
      hrefPrefix: `${hrefPrefix}?sortBy=something&sortDirection=asc&`,
    })
  })

  it('should append additonal parameters to the hrefPrefix', () => {
    const request = createMock<Request>({ query: { page: '1', sortBy: 'something', sortDirection: 'asc' } })

    expect(getPaginationDetails(request, hrefPrefix, { foo: 'bar' })).toEqual({
      pageNumber: 1,
      sortBy: 'something',
      sortDirection: 'asc',
      hrefPrefix: `${hrefPrefix}?foo=bar&sortBy=something&sortDirection=asc&`,
    })
  })

  it('should default the sort column', () => {
    const request = createMock<Request>({ query: { page: '1' } })

    expect(getPaginationDetails(request, hrefPrefix, { foo: 'bar' }, 'defaultSort')).toEqual({
      pageNumber: 1,
      sortBy: 'defaultSort',
      sortDirection: undefined,
      hrefPrefix: `${hrefPrefix}?foo=bar&sortBy=defaultSort&`,
    })
  })
})
