import { placementDates } from './placementDates'

describe('placementDates', () => {
  it('returns formatted versions of the placement dates and durations', () => {
    const startDate = '2022-01-01'
    const lengthInDays = '4'

    expect(placementDates(startDate, lengthInDays)).toEqual({
      startDate: '2022-01-01',
      endDate: '2022-01-05',
      placementLength: 4,
    })
  })
})
