import { when } from 'jest-when'
import { addDays, addMonths } from 'date-fns'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'
import { startDateOutsideOfNationalStandardsTimescales } from './startDateOutsideOfNationalStandardsTimescales'
import { applicationFactory, cas1RequestedPlacementPeriodFactory } from '../../testutils/factories'

jest.mock('./arrivalDateFromApplication')
jest.mock('../dateUtils')

describe('startDateOutsideOfNationalStandardsTimescales', () => {
  const arrival = '2023-01-01'
  let application = applicationFactory.build({
    requestedPlacementPeriod: cas1RequestedPlacementPeriodFactory.build({ arrival }),
  })
  const now = new Date()

  beforeAll(() => {
    when(arrivalDateFromApplication).calledWith(application).mockReturnValue(arrival)
  })

  it('should return true if the start date is less than six months away', () => {
    const startDate = addMonths(now, 2)
    when(DateFormats.isoToDateObj).calledWith(arrival).mockReturnValue(startDate)

    expect(startDateOutsideOfNationalStandardsTimescales(application)).toEqual(true)
  })

  it('should return true with fractional dates', () => {
    const startDate = addDays(addMonths(now, 5), 22)
    when(DateFormats.isoToDateObj).calledWith(arrival).mockReturnValue(startDate)

    expect(startDateOutsideOfNationalStandardsTimescales(application)).toEqual(true)
  })

  it('should return false if the start date is more than six months away', () => {
    const startDate = addMonths(now, 7)
    when(DateFormats.isoToDateObj).calledWith(arrival).mockReturnValue(startDate)

    expect(startDateOutsideOfNationalStandardsTimescales(application)).toEqual(false)
  })

  it('should return false with fractional dates', () => {
    const startDate = addDays(addMonths(now, 6), 3)
    when(DateFormats.isoToDateObj).calledWith(arrival).mockReturnValue(startDate)

    expect(startDateOutsideOfNationalStandardsTimescales(application)).toEqual(false)
  })

  it('should return false when there is no start date', () => {
    application = applicationFactory.build({
      requestedPlacementPeriod: cas1RequestedPlacementPeriodFactory.build({ arrival: undefined }),
    })

    expect(startDateOutsideOfNationalStandardsTimescales(application)).toEqual(false)
  })
})
