import { addDays } from 'date-fns'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { DateFormats } from '../../../utils/dateUtils'
import { getDefaultPlacementDurationInDays } from '../../../utils/applications/getDefaultPlacementDurationInDays'
import { SessionDataError } from '../../../utils/errors'

import PlacementDuration from './placementDuration'
import { applicationFactory } from '../../../testutils/factories'
import { addResponsesToFormArtifact } from '../../../testutils/addToApplication'

jest.mock('../../../utils/applications/getDefaultPlacementDurationInDays')

describe('PlacementDuration', () => {
  let data: Record<string, unknown>
  let application: ApprovedPremisesApplication

  beforeEach(() => {
    application = applicationFactory
      .withReleaseDate()
      .withPageResponse({ task: 'type-of-ap', page: 'ap-type', key: 'type', value: 'standard' })
      .build()
  })

  describe('body', () => {
    it('should set the body and duration', () => {
      const body = { differentDuration: 'yes' as const, durationDays: '4', durationWeeks: '7', reason: 'Some reason' }
      const page = new PlacementDuration(body, application)

      expect(page.body).toEqual({ ...body, duration: '53' })
    })

    it('should not set the duration if differentDuration is not yes', () => {
      const body = { differentDuration: 'no' as const }
      const page = new PlacementDuration(body, application)
      expect(page.body).toEqual(body)
    })

    it('should not set the duration if durationDays is not set', () => {
      const body = { differentDuration: 'yes' as const, durationWeeks: '4' }
      const page = new PlacementDuration(body, application)
      expect(page.body).toEqual(body)
    })

    it('should not set the duration if durationWeeks is not set', () => {
      const body = { differentDuration: 'yes' as const, durationDays: '4' }
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

    it('returns undefined if the "placement-date" object is not present', () => {
      application = applicationFactory.build({ data: { 'basic-information': {} } })

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toBeUndefined()
    })

    it('returns null if the start date is the same as the release date and the "release-date" object is not present', () => {
      application = applicationFactory.build({
        data: {
          'basic-information': {
            'placement-date': {
              startDateSameAsReleaseDate: 'yes',
            },
          },
        },
      })

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toBeUndefined()
    })
  })

  describe('departureDate', () => {
    const releaseDate = new Date(2023, 1, 1)

    it('returns the arrival date plus the default placement duration', () => {
      ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValueOnce(12)

      application = applicationFactory.withReleaseDate(DateFormats.dateObjToIsoDate(releaseDate)).build()

      expect(new PlacementDuration({}, application).departureDate).toEqual(addDays(releaseDate, 7 * 12))
    })
  })

  describe('the previous and next page are correct', () => {
    beforeEach(() => {
      application = addResponsesToFormArtifact(application, {
        section: 'basic-information',
        page: 'placement-date',
        keyValuePairs: { startDateSameAsReleaseDate: 'no', startDate: '2022-11-11' },
      }) as ApprovedPremisesApplication
    })

    it('next', () => {
      expect(new PlacementDuration({}, application).next()).toBe('relocation-region')
    })
    it('previous', () => {
      expect(new PlacementDuration({}, application).previous()).toBe('dashboard')
    })
  })

  describe('errors', () => {
    it('returns an error if the different duration response is not defined', () => {
      const page = new PlacementDuration({}, application)

      expect(page.errors()).toEqual({
        differentDuration: 'You must specify if this application requires a different placement length',
      })
    })

    it('returns an error if the different duration response is yes but the reason and duration arent defined', () => {
      const page = new PlacementDuration({ differentDuration: 'yes' }, application)

      expect(page.errors()).toEqual({
        duration: 'You must specify the duration of the placement',
        reason: 'You must specify the reason for the different placement duration',
      })
    })

    it('returns an error if the different duration response is yes but both durations are not set', () => {
      let page = new PlacementDuration(
        { differentDuration: 'yes', durationWeeks: '1', reason: 'Some reason' },
        application,
      )

      expect(page.errors()).toEqual({
        duration: 'You must specify the duration of the placement',
      })

      page = new PlacementDuration({ differentDuration: 'yes', durationDays: '1', reason: 'Some reason' }, application)

      expect(page.errors()).toEqual({
        duration: 'You must specify the duration of the placement',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new PlacementDuration(
        { differentDuration: 'yes' as const, durationDays: '4', durationWeeks: '1', reason: 'Some reason' },
        application,
      )

      expect(page.response()).toEqual({
        'Does this application require a different placement duration?': 'Yes',
        'How many weeks will the person stay at the AP?': '1 week, 4 days',
        'Why does this person require a different placement duration?': 'Some reason',
      })
    })

    it("should not include the detail if it's blank", () => {
      const page = new PlacementDuration({ differentDuration: 'no' as const, duration: '' }, application)

      expect(page.response()).toEqual({ 'Does this application require a different placement duration?': 'No' })
    })
  })
})
