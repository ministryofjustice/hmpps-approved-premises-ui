import { formatISO } from 'date-fns'
import {
  daysSinceInfoRequest,
  daysSinceReceived,
  daysToWeeksAndDays,
  daysUntilDue,
  formatDays,
  formatDaysUntilDueWithWarning,
  formattedArrivalDate,
} from './dateUtils'
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

  describe('daysUntilDue', () => {
    it('returns the days until the assessment is due', () => {
      const assessment = assessmentSummaryFactory.createdXDaysAgo(1).build()

      expect(daysUntilDue(assessment)).toEqual(1)
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

  describe('formatDaysUntilDueWithWarning', () => {
    it('returns the number of days without a warning if the due date is not soon', () => {
      DateFormats.differenceInBusinessDays = jest.fn().mockReturnValue(9)
      const assessment = assessmentSummaryFactory.build({
        createdAt: DateFormats.dateObjToIsoDate(new Date()),
      })

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual('9 Days')
    })

    it('returns the number of days with a warning if the due date is soon', () => {
      DateFormats.differenceInBusinessDays = jest.fn().mockReturnValue(1)
      const assessment = assessmentSummaryFactory.createdXDaysAgo(1).build()

      expect(formatDaysUntilDueWithWarning(assessment)).toEqual(
        '<strong class="assessments--index__warning">1 Day<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>',
      )
    })
  })

  describe('daysToWeeksAndDays', () => {
    it('should return zero weeks when a day length is less than 7 days', () => {
      expect(daysToWeeksAndDays(6)).toEqual({ days: 6, weeks: 0 })
    })

    it('should return one week when a day length is 7 days', () => {
      expect(daysToWeeksAndDays(7)).toEqual({ days: 0, weeks: 1 })
    })

    it('should return week and days for a long length', () => {
      expect(daysToWeeksAndDays(52)).toEqual({ days: 3, weeks: 7 })
    })

    it('should convert a string value to a number', () => {
      expect(daysToWeeksAndDays('7')).toEqual({ days: 0, weeks: 1 })
    })
  })
})
