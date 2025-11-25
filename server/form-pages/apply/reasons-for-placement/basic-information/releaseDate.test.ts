import { add } from 'date-fns'
import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue } from '../../../shared'

import ReleaseDate from './releaseDate'
import { applicationFactory } from '../../../../testutils/factories'
import { adjacentPageFromSentenceType } from '../../../../utils/applications/adjacentPageFromSentenceType'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/applications/adjacentPageFromSentenceType')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('ReleaseDate', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'yes',
          'releaseDate-year': '2022',
          'releaseDate-month': '3',
          'releaseDate-day': '3',
        },
        application,
      )

      expect(page.body).toEqual({
        knowReleaseDate: 'yes',
        'releaseDate-year': '2022',
        'releaseDate-month': '3',
        'releaseDate-day': '3',
        releaseDate: '2022-03-03',
      })
    })
  })

  describe('when knowReleaseDate is set to yes', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'yes' }, application), 'placement-date')
  })

  describe('when knowReleaseDate is set to no', () => {
    itShouldHaveNextValue(new ReleaseDate({ knowReleaseDate: 'no' }, application), 'oral-hearing')
  })

  describe('previous', () => {
    it('should call adjacentPageFromSentenceType with the sentenceType from the application and return the result', () => {
      ;(
        retrieveQuestionResponseFromFormArtifact as jest.MockedFn<typeof retrieveQuestionResponseFromFormArtifact>
      ).mockReturnValue('standardDeterminate')
      ;(adjacentPageFromSentenceType as jest.MockedFn<typeof adjacentPageFromSentenceType>).mockReturnValue(
        'release-type',
      )

      const result = new ReleaseDate({ knowReleaseDate: 'yes' }, application).previous()

      expect(result).toEqual('release-type')
      expect(adjacentPageFromSentenceType).toHaveBeenCalledWith('standardDeterminate')
    })
  })

  describe('errors', () => {
    describe('if the user knows the release date', () => {
      it('should return an empty object if the date is specified', () => {
        const releaseDate = add(new Date(), { days: 5 })
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
            ...DateFormats.dateObjectToDateInputs(releaseDate, 'releaseDate'),
          },
          application,
        )
        expect(page.errors()).toEqual({})
      })

      it('should return an error if the date is not populated', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
          },
          application,
        )
        expect(page.errors()).toEqual({ releaseDate: 'You must specify the release date' })
      })

      it('should return an error if the date is invalid', () => {
        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
            'releaseDate-year': '99',
            'releaseDate-month': '99',
            'releaseDate-day': '99',
          },
          application,
        )
        expect(page.errors()).toEqual({ releaseDate: 'The release date is an invalid date' })
      })

      it('should not return an error if the date is today', () => {
        const releaseDate = new Date(new Date().setHours(0, 0, 0, 0))

        const page = new ReleaseDate(
          {
            knowReleaseDate: 'yes',
            ...DateFormats.dateObjectToDateInputs(releaseDate, 'releaseDate'),
          },
          application,
        )
        expect(page.errors()).toEqual({})
      })
    })

    it('should return an empty object if the user does not know the release date', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'no',
        },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the knowReleaseDate field is not populated', () => {
      const page = new ReleaseDate({}, application)
      expect(page.errors()).toEqual({ knowReleaseDate: 'You must specify if you know the release date' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when the user does not know the release date', () => {
      const page = new ReleaseDate(
        {
          knowReleaseDate: 'no',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when the user knows the release date', () => {
      const body = {
        knowReleaseDate: 'yes' as const,
        'releaseDate-year': '2022',
        'releaseDate-month': '11',
        'releaseDate-day': '11',
      }
      const page = new ReleaseDate(body, application)

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        'Release Date': DateFormats.dateAndTimeInputsToUiDate(body, 'releaseDate'),
      })
    })
  })
})
