import { dateBodyProperties } from './dateBodyProperties'

describe('dateBodyProperties', () => {
  it('returns date field names for use in page body properties', () => {
    expect(dateBodyProperties('someDate')).toEqual(['someDate-year', 'someDate-month', 'someDate-day'])
  })
})
