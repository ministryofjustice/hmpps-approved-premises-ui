import { Cas1Application } from '@approved-premises/api'
import { addDays } from 'date-fns'
import { createMock } from '@golevelup/ts-jest'
import { getDefaultPlacementDurationInDays } from '../../../utils/applications/getDefaultPlacementDurationInDays'

import PlacementDuration from './placementDuration'
import { applicationFactory, personFactory, tierDtoFactory } from '../../../testutils/factories'
import { addResponsesToFormArtifact } from '../../../testutils/addToApplication'
import { arrivalDateFromApplication } from '../../../utils/applications/arrivalDateFromApplication'
import { DateFormats } from '../../../utils/dateUtils'
import * as formUtils from '../../../utils/formUtils'
import { ApplicationService } from '../../../services'

jest.mock('../../../utils/applications/getDefaultPlacementDurationInDays')
jest.mock('../../../utils/applications/arrivalDateFromApplication')

const applicationService = createMock<ApplicationService>({})
const token = 'test_token'

describe('PlacementDuration', () => {
  let application: Cas1Application

  const buildApplication = (tierVersion: 'V2' | 'V3') =>
    applicationFactory
      .withReleaseDate()
      .withPageResponse({ task: 'type-of-ap', page: 'ap-type', key: 'type', value: 'normal' })
      .build({ person: personFactory.build({ tier: tierDtoFactory.build({ version: tierVersion }) }) })

  beforeEach(() => {
    application = buildApplication('V2')
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

  describe('initializeDates', () => {
    it('sets the dates based on arrivalDateFromApplication', async () => {
      const arrivalDate = '2022-11-11'
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValue({
        defaultDurationDays: 30,
        maxDurationDays: 50,
      })

      const page = await PlacementDuration.initialize({}, application, token, { applicationService })

      expect(page.arrivalDate).toEqual(DateFormats.isoDateToUIDate(arrivalDate))
      const arrivalDatePlus30Days = addDays(new Date(arrivalDate), 30)
      expect(page.departureDate).toEqual(DateFormats.dateObjtoUIDate(arrivalDatePlus30Days))
    })

    it('sets the dates to undefined if the dates are not specified', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toEqual(undefined)
      expect(page.departureDate).toEqual(undefined)
    })
  })

  describe('the previous and next page are correct', () => {
    beforeEach(() => {
      application = addResponsesToFormArtifact(application, {
        task: 'basic-information',
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

    it('validates the duration fields', () => {
      jest.spyOn(formUtils, 'validWeeksAndDaysDuration')

      const page = new PlacementDuration(
        {
          differentDuration: 'yes',
          durationWeeks: 'a',
          durationDays: 'b',
          reason: 'Some reason',
        },
        application,
      )

      expect(page.errors()).toEqual({
        duration: 'You must specify the duration of the placement',
      })
      expect(formUtils.validWeeksAndDaysDuration).toHaveBeenCalledWith('a', 'b')
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

  describe('when the person has a version 3 tier', () => {
    beforeEach(() => {
      application = buildApplication('V3')
    })

    it('shows the placement length content', () => {
      const page = new PlacementDuration({}, application)

      expect(page.isV3Tier).toEqual(true)
      expect(page.title).toEqual('Placement length and dates')
      expect(page.questions).toEqual({
        differentDuration: 'Do you want to change the placement length?',
        duration: 'New placement length',
        reason: 'Reason for change',
      })
    })

    it('labels the keep-duration option with the calculated placement length', () => {
      const page = new PlacementDuration({ defaultDurationDays: 112 }, application)

      expect(page.keepDurationLabel).toEqual('No, apply for 16 weeks')
    })

    it('labels the keep-duration option with a bare No when the API returns no default duration', () => {
      const page = new PlacementDuration({ defaultDurationDays: undefined }, application)

      expect(page.keepDurationLabel).toEqual('No')
    })
  })
})
