import type { Request } from 'express'
import { createMock } from '@golevelup/ts-jest'
import { getSearchOptions } from './getSearchOptions'

interface MySearchOptions {
  foo: string
  fizz: string
}

describe('getSearchOptions', () => {
  it('should return all search options if provided', () => {
    const request = createMock<Request>({
      query: {
        foo: 'bar',
        fizz: 'buzz',
      },
    })

    expect(getSearchOptions<MySearchOptions>(request, ['foo', 'fizz'])).toEqual({ foo: 'bar', fizz: 'buzz' })
  })

  it('should not return empty search options', () => {
    const request = createMock<Request>({
      query: {
        foo: 'bar',
        fizz: undefined,
      },
    })

    expect(getSearchOptions<MySearchOptions>(request, ['foo', 'fizz'])).toEqual({ foo: 'bar' })
  })

  it('should return an empty array if there are no search filters provided', () => {
    const request = createMock<Request>({
      query: {
        something: 'else',
      },
    })

    expect(getSearchOptions<MySearchOptions>(request, ['foo', 'fizz'])).toEqual({})
  })
})
