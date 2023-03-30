import { add, sub } from 'date-fns'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

import PlacementDate from './placementDate'
import { DateFormats } from '../../../../utils/dateUtils'
import { applicationFactory } from '../../../../testutils/factories'

const releaseDate = new Date().toISOString()

jest.mock('../../../../utils/applications/noticeTypeFromApplication')
jest.mock('../../../../utils/retrieveQuestionResponseFromApplicationOrAssessment', () => {
  return { retrieveQuestionResponseFromApplicationOrAssessment: jest.fn(() => releaseDate) }
})

describe('PlacementDate', () => {
  const application = applicationFactory.build()

  describe('title', () => {
    it('set the title and body correctly', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'no',
          'startDate-year': '2020',
          'startDate-month': '12',
          'startDate-day': '1',
        },
        application,
      )

      expect(page.body).toEqual({
        startDateSameAsReleaseDate: 'no',
        'startDate-year': '2020',
        'startDate-month': '12',
        'startDate-day': '1',
        startDate: '2020-12-01',
      })

      expect(page.title).toEqual(
        `Is ${DateFormats.isoDateToUIDate(releaseDate)} the date you want the placement to start?`,
      )
    })
  })

  describe('when the notice type is standard', () => {
    beforeEach(() => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
    })

    itShouldHaveNextValue(new PlacementDate({}, application), 'placement-purpose')
  })

  describe('when the notice type is emergency', () => {
    beforeEach(() => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
    })

    itShouldHaveNextValue(new PlacementDate({}, application), 'reason-for-short-notice')
  })

  describe('when the notice type is short_notice', () => {
    beforeEach(() => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('short_notice')
    })

    itShouldHaveNextValue(new PlacementDate({}, application), 'reason-for-short-notice')
  })

  itShouldHavePreviousValue(new PlacementDate({}, application), 'release-date')

  describe('errors', () => {
    it('should return an empty object if the release date is the same as the start date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'yes',
        },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    describe('if the start date is not the same as the release date', () => {
      it('should return an empty object if the date is specified', () => {
        const placementDate = add(new Date(), { days: 5 })
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            ...DateFormats.dateObjectToDateInputs(placementDate, 'startDate'),
          },
          application,
        )
        expect(page.errors()).toEqual({})
      })

      it('should return an error if the date is not specified', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
          },
          application,
        )
        expect(page.errors()).toEqual({ startDate: 'You must enter a start date' })
      })

      it('should return an error if the date is invalid', () => {
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            'startDate-year': '999999',
            'startDate-month': '99999',
            'startDate-day': '9999',
          },
          application,
        )
        expect(page.errors()).toEqual({ startDate: 'The start date is an invalid date' })
      })

      it('should return an error if the date is in the past', () => {
        const placementDate = sub(new Date(), { months: 5 })
        const page = new PlacementDate(
          {
            startDateSameAsReleaseDate: 'no',
            ...DateFormats.dateObjectToDateInputs(placementDate, 'startDate'),
          },
          application,
        )
        expect(page.errors()).toEqual({ startDate: 'The start date must not be in the past' })
      })
    })

    it('should return an error if the startDateSameAsReleaseDate field is not populated', () => {
      const page = new PlacementDate({}, application)
      expect(page.errors()).toEqual({
        startDateSameAsReleaseDate: 'You must specify if the start date is the same as the release date',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the start date is the same as the release date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'yes',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })

    it('should return a translated version of the response when the start date is not the same as the release date', () => {
      const page = new PlacementDate(
        {
          startDateSameAsReleaseDate: 'no',
          'startDate-year': '2022',
          'startDate-month': '11',
          'startDate-day': '11',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
        'Placement Start Date': 'Friday 11 November 2022',
      })
    })
  })
})
