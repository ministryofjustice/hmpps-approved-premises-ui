import { Cas1Application } from '@approved-premises/api'
import { addDays } from 'date-fns'
import { createMock } from '@golevelup/ts-jest'
import { getDefaultPlacementDurationInDays } from '../../../utils/applications/getDefaultPlacementDurationInDays'

import PlacementDuration from './placementDuration'
import { applicationFactory } from '../../../testutils/factories'
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

  beforeEach(() => {
    application = applicationFactory
      .withReleaseDate()
      .withPageResponse({ task: 'type-of-ap', page: 'ap-type', key: 'type', value: 'normal' })
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
      expect(page.body.durationCannotBeCalculated).toEqual(false)
    })

    it('sets durationCannotBeCalculated and no dates if no duration is returned', async () => {
      const arrivalDate = '2026-01-01'
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      ;(getDefaultPlacementDurationInDays as jest.Mock).mockReturnValue({
        defaultDurationDays: undefined,
        maxDurationDays: undefined,
      })

      const page = await PlacementDuration.initialize({}, application, token, { applicationService })

      expect(page.body.durationCannotBeCalculated).toEqual(true)
      expect(page.arrivalDate).toEqual(undefined)
      expect(page.departureDate).toEqual(undefined)
    })

    it('sets the dates to undefined if the dates are not specified', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)

      const page = new PlacementDuration({}, application)

      expect(page.arrivalDate).toEqual(undefined)
      expect(page.departureDate).toEqual(undefined)
    })
  })

  describe('title', () => {
    it('should return the title', () => {
      const page = new PlacementDuration({ differentDuration: 'no' }, application)

      expect(page.title).toEqual('Placement duration and move on')
    })

    it('should return a different title if the duration cannot be calculated', () => {
      const page = new PlacementDuration({ durationCannotBeCalculated: true }, application)

      expect(page.title).toEqual('Placement length cannot be calculated')
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

    it('returns no errors if the duration cannot be calculated', () => {
      const page = new PlacementDuration({ durationCannotBeCalculated: true }, application)

      expect(page.errors()).toEqual({})
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

    it('should return a message instead of answers if the duration cannot be calculated', () => {
      const page = new PlacementDuration({ durationCannotBeCalculated: true }, application)

      expect(page.response()).toEqual({
        'Placement length cannot be calculated': 'The assessor will enter the length of stay.',
      })
    })

    it("should not include the detail if it's blank", () => {
      const page = new PlacementDuration({ differentDuration: 'no' as const, duration: '' }, application)

      expect(page.response()).toEqual({ 'Does this application require a different placement duration?': 'No' })
    })
  })
})
