import { Application } from '@approved-premises/api'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { SessionDataError } from '../../../utils/errors'

import PlacementDuration from './placementDuration'
import applicationFactory from '../../../testutils/factories/application'

describe('PlacementDuration', () => {
  let data: Record<string, unknown>
  let application: Application

  beforeEach(() => {
    data = {
      'basic-information': {
        'placement-date': {
          startDateSameAsReleaseDate: 'no',
          startDate: '2022-11-11',
        },
      },
    }
    application = applicationFactory.build({ data })
  })

  describe('body', () => {
    it('should set the body', () => {
      const body = { duration: 4, durationDetail: 'Some detail' }
      const page = new PlacementDuration(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('arrivalDate', () => {
    it('returns the placement date if the start date is not the same as the release date', () => {
      data = {
        'basic-information': {
          'placement-date': {
            startDateSameAsReleaseDate: 'no',
            startDate: '2022-11-11',
          },
        },
      }
      application = applicationFactory.build({ data })

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toEqual(new Date(2022, 10, 11))
    })

    it('returns the release date if the start date is the same as the release date', () => {
      data = {
        'basic-information': {
          'placement-date': {
            startDateSameAsReleaseDate: 'yes',
          },
          'release-date': {
            releaseDate: '2022-12-11',
          },
        },
      }
      application = applicationFactory.build({ data })

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toEqual(new Date(2022, 11, 11))
    })

    it('throws an error if the "basic-information" object is not present', () => {
      application = applicationFactory.build({ data: {} })

      expect(() => new PlacementDuration({}, application)).toThrow(
        new SessionDataError('Move on information placement duration error: Error: No basic information'),
      )
    })

    it('throws an error if the "placement-date" object is not present', () => {
      application = applicationFactory.build({ data: { 'basic-information': {} } })

      expect(() => new PlacementDuration({}, application)).toThrow(
        new SessionDataError('Move on information placement duration error: Error: No placement date'),
      )
    })

    it('throws an error if the start date is the same as the release date and the "release-date" object is not present', () => {
      application = applicationFactory.build({
        data: {
          'basic-information': {
            'placement-date': {
              startDateSameAsReleaseDate: 'yes',
            },
          },
        },
      })

      expect(() => new PlacementDuration({}, application)).toThrow(
        new SessionDataError('Move on information placement duration error: Error: No release date'),
      )
    })
  })

  describe('the previous and next page are correct', () => {
    data = {
      'basic-information': {
        'placement-date': {
          startDateSameAsReleaseDate: 'no',
          startDate: '2022-11-11',
        },
      },
    }
    application = applicationFactory.build({ data })

    itShouldHaveNextValue(new PlacementDuration({}, application), 'relocation-region')
    itShouldHavePreviousValue(new PlacementDuration({}, application), '')
  })

  describe('errors', () => {
    it('returns an error if the duration is blank', () => {
      const page = new PlacementDuration({}, application)

      expect(page.errors()).toEqual({ duration: 'You must specify the duration of the placement' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new PlacementDuration({ duration: 4, durationDetail: 'Some detail' }, application)

      expect(page.response()).toEqual({
        'What duration of placement do you recommend?': '4 weeks',
        'Provide any additional information': 'Some detail',
      })
    })

    it("should not include the detail if it's blank", () => {
      const page = new PlacementDuration({ duration: 4, durationDetail: '' }, application)

      expect(page.response()).toEqual({ 'What duration of placement do you recommend?': '4 weeks' })
    })
  })
})
