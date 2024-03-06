import { addBusinessDays as addBusinessDaysDateFns, formatISO } from 'date-fns'
import { daysSinceInfoRequest, daysSinceReceived, formatDays, formattedArrivalDate } from './dateUtils'
import { DateFormats } from '../dateUtils'
import { assessmentFactory, assessmentSummaryFactory } from '../../testutils/factories'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'

jest.mock('../applications/arrivalDateFromApplication')
jest.mock('../dateUtils', () => ({
  DateFormats: {
    isoToDateObj: jest.fn().mockImplementation(date => new Date(date)),
    dateObjToIsoDate: jest.fn().mockImplementation(date => formatISO(date)),
    dateObjToIsoDateTime: jest.fn().mockImplementation(date => formatISO(date)),
    differenceInBusinessDays: jest.fn().mockReturnValue(1),
  },
  addBusinessDays: jest.fn().mockImplementation((date, days) => addBusinessDaysDateFns(date, days)),
}))

describe('dateUtils', () => {
  describe('daysSinceReceived', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const assessment = assessmentSummaryFactory.createdXDaysAgo(10).build()

      expect(daysSinceReceived(assessment)).toEqual(10)
    })
  })

  describe('daysSinceInfoRequest', () => {
    it('returns the difference in days since the assessment has been received', () => {
      const today = new Date()

      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4)
      const assessment = assessmentSummaryFactory.build({
        dateOfInfoRequest: DateFormats.dateObjToIsoDate(date),
      })

      expect(daysSinceInfoRequest(assessment)).toEqual(4)
    })

    it('returns undefined if there are no info requests', () => {
      const assessment = assessmentSummaryFactory.build({ dateOfInfoRequest: undefined })

      expect(daysSinceInfoRequest(assessment)).toEqual(undefined)
    })
  })

  describe('formatDays', () => {
    it('returns the singular form if there is 1 day', () => {
      expect(formatDays(1)).toEqual('1 Day')
    })

    it('returns the plural form if there is more than 1 day', () => {
      expect(formatDays(22)).toEqual('22 Days')
    })

    it('returns N/A if the day in undefined', () => {
      expect(formatDays(undefined)).toEqual('N/A')
    })
  })

  describe('formattedArrivalDate', () => {
    describe('with assessment summaries', () => {
      it('returns the formatted arrival date from the application', () => {
        const assessment = assessmentSummaryFactory.build({ arrivalDate: '2022-01-01' })

        expect(formattedArrivalDate(assessment)).toEqual('1 Jan 2022')
      })

      it('returns "Not provided" if there is no arrival date for the application', () => {
        const assessment = assessmentSummaryFactory.build({ arrivalDate: undefined })

        expect(formattedArrivalDate(assessment)).toEqual('Not provided')
      })
    })

    describe('with assessments', () => {
      it('returns the formatted arrival date from the application', () => {
        const assessment = assessmentFactory.build()
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2022-01-01')

        expect(formattedArrivalDate(assessment)).toEqual('1 Jan 2022')
        expect(arrivalDateFromApplication).toHaveBeenCalledWith(assessment.application)
      })

      it('returns "Not provided" if there is no arrival date for the application', () => {
        const assessment = assessmentFactory.build()
        ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(null)

        expect(formattedArrivalDate(assessment)).toEqual('Not provided')
        expect(arrivalDateFromApplication).toHaveBeenCalledWith(assessment.application)
      })
    })
  })
})
