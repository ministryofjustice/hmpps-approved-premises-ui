import { normaliseCrn } from './normaliseCrn'

describe('normaliseCrn', () => {
  it('capitalises and removes leading and trailing spaces from crns', () => {
    expect(normaliseCrn('abc123')).toEqual('ABC123')
  })

  it('returns undefined if the crn is empty', () => {
    expect(normaliseCrn(undefined)).toEqual(undefined)
  })
})
