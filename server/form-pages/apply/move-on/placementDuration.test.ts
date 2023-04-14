import { addDays } from 'date-fns'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { SessionDataError } from '../../../utils/errors'

import PlacementDuration from './placementDuration'
import { applicationFactory } from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import { addResponseToApplication, addResponsesToApplication } from '../../../testutils/addToApplication'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../../../utils/retrieveQuestionResponseFromApplicationOrAssessment'

jest.mock('../../../utils/retrieveQuestionResponseFromApplicationOrAssessment.ts')

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
    it('should set the body', () => {
      const body = { differentDuration: 'yes' as const, duration: '4', reason: 'Some reason' }
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

  describe('departureDate', () => {
    const releaseDate = new Date(2023, 1, 1)

    it('returns the arrival date plus 12 weeks if the ap type is standard', () => {
      ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('standard')

      application = applicationFactory
        .withReleaseDate(DateFormats.dateObjToIsoDate(releaseDate))
        .withPageResponse({ task: 'type-of-ap', page: 'ap-type', key: 'type', value: 'standard' })
        .build()

      expect(new PlacementDuration({}, application).departureDate).toEqual(addDays(releaseDate, 7 * 12))
    })

    it('returns the arrival date plus 26 weeks if the ap type is PIPE', () => {
      ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('pipe')

      application = applicationFactory.withReleaseDate(DateFormats.dateObjToIsoDate(releaseDate)).build()
      application = addResponseToApplication(application, {
        section: 'type-of-ap',
        page: 'ap-type',
        key: 'type',
        value: 'pipe',
      })

      expect(new PlacementDuration({}, application).departureDate).toEqual(addDays(releaseDate, 7 * 26))
    })

    it('returns the arrival date plus 56 weeks if the ap type is ESAP', () => {
      ;(retrieveQuestionResponseFromApplicationOrAssessment as jest.Mock).mockReturnValueOnce('esap')

      application = applicationFactory.withReleaseDate(DateFormats.dateObjToIsoDate(releaseDate)).build()
      application = addResponseToApplication(application, {
        section: 'type-of-ap',
        page: 'ap-type',
        key: 'type',
        value: 'esap',
      })

      expect(new PlacementDuration({}, application).departureDate).toEqual(addDays(releaseDate, 7 * 56))
    })
  })

  describe('the previous and next page are correct', () => {
    beforeEach(() => {
      application = addResponsesToApplication(application, {
        section: 'basic-information',
        page: 'placement-date',
        keyValuePairs: { startDateSameAsReleaseDate: 'no', startDate: '2022-11-11' },
      })
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
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new PlacementDuration(
        { differentDuration: 'yes' as const, duration: '4', reason: 'Some reason' },
        application,
      )

      expect(page.response()).toEqual({
        'Does this application require a different placement duration?': 'Yes',
        'How many weeks will the person stay at the AP?': '4 weeks',
        'Why does this person require a different placement duration?': 'Some reason',
      })
    })

    it("should not include the detail if it's blank", () => {
      const page = new PlacementDuration({ differentDuration: 'no' as const, duration: '' }, application)

      expect(page.response()).toEqual({ 'Does this application require a different placement duration?': 'No' })
    })
  })
})
