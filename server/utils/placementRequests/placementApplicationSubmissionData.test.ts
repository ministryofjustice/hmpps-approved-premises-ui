import {
  Cas1RequestedPlacementPeriod,
  Cas1RequestsForPlacementDurationsCalculationResponseDto,
} from '@approved-premises/api'

import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'

import {
  cas1RequestsForPlacementDurationsCalculationResponseDtoFactory,
  placementApplicationFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import {
  durationAndArrivalDateFromPlacementApplication,
  placementApplicationSubmissionData,
} from './placementApplicationSubmissionData'

import * as retrieveQuestionResponseFromFormArtifact from '../retrieveQuestionResponseFromFormArtifact'
import * as pageUtils from '../../form-pages/utils'

describe('placementApplicationSubmissionData', () => {
  const datesOfPlacement = [
    {
      duration: '15',
      durationDays: '1',
      durationWeeks: '2',
      'arrivalDate-year': '2023',
      'arrivalDate-month': '12',
      'arrivalDate-day': '1',
      arrivalDate: '2023-12-01',
      isFlexible: 'yes',
    },
    {
      duration: '23',
      durationDays: '2',
      durationWeeks: '3',
      'arrivalDate-year': '2024',
      'arrivalDate-month': '1',
      'arrivalDate-day': '2',
      arrivalDate: '2024-01-02',
      isFlexible: 'no',
    },
  ]

  const datesOfPlacementForApi: Array<Cas1RequestedPlacementPeriod> = [
    {
      duration: 15,
      arrivalFlexible: true,
      arrival: '2023-12-01',
    },
    {
      duration: 23,
      arrivalFlexible: false,
      arrival: '2024-01-02',
    },
  ]

  describe('placementApplicationSubmissionData', () => {
    it('returns the data in the correct format for submission', async () => {
      const placementApplication = placementApplicationFactory.build({
        data: {
          'request-a-placement': {
            'sentence-type-check': { sentenceTypeCheck: 'yes' },
            'release-type': { releaseType: 'rotl' },
            'sentence-type': { sentenceType: 'licence' },
          },
        },
      })

      expect(placementApplicationSubmissionData(placementApplication, datesOfPlacementForApi)).toEqual({
        sentenceType: 'licence',
        releaseType: 'rotl',
        translatedDocument: {},
        requestedPlacementPeriods: datesOfPlacementForApi,
      })
    })
  })

  describe('durationAndArrivalDateFromPlacementApplication', () => {
    const durationResponse: Cas1RequestsForPlacementDurationsCalculationResponseDto = {
      defaultDurationDays: 60,
      maxDurationDays: 80,
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns the arrivalDate and duration from the dates-of-placement page if the "releaseType" is "rotl"', async () => {
      const placementApplication = placementApplicationFactory.build({
        data: {
          'request-a-placement': {
            'release-type': { releaseType: 'rotl' },
            'sentence-type-check': { sentenceTypeCheck: 'yes' },
          },
        },
      })

      jest.spyOn(pageUtils, 'pageDataFromApplicationOrAssessment').mockReturnValue({
        datesOfPlacement,
      })

      expect(durationAndArrivalDateFromPlacementApplication(placementApplication, durationResponse)).toEqual(
        datesOfPlacementForApi,
      )
      expect(pageUtils.pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
    })

    it('returns the arrivalDate and duration from the legacy placement dates if the "reason" is "rotl"', async () => {
      const placementApplication = placementApplicationFactory.build({
        data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
      })
      jest.spyOn(pageUtils, 'pageDataFromApplicationOrAssessment').mockReturnValue({
        ...DateFormats.isoDateToDateInputs(datesOfPlacement[0].arrivalDate, 'arrivalDate'),
        duration: datesOfPlacement[0].duration,
        durationDays: datesOfPlacement[0].durationDays,
      })

      expect(durationAndArrivalDateFromPlacementApplication(placementApplication, durationResponse)).toEqual([
        { ...datesOfPlacementForApi[0], arrivalFlexible: undefined },
      ])
    })

    it('calculates the release date to be decision to release date + 6 weeks and uses the passed-in duration if release type is "paroleDirectedLicence', async () => {
      const placementApplication = placementApplicationFactory.build({
        data: {
          'request-a-placement': {
            'sentence-type-check': { sentenceTypeCheck: 'yes' },
            'release-type': { releaseType: 'paroleDirectedLicence' },
            'additional-placement-details': { arrivalDate: '2026-01-10', duration: '45' },
          },
        },
      })
      const placementDurations = cas1RequestsForPlacementDurationsCalculationResponseDtoFactory.build()

      jest
        .spyOn(retrieveQuestionResponseFromFormArtifact, 'retrieveQuestionResponseFromFormArtifact')
        .mockReturnValue('2023-01-01')

      expect(durationAndArrivalDateFromPlacementApplication(placementApplication, placementDurations)).toEqual([
        {
          duration: placementDurations.defaultDurationDays,
          arrival: '2023-02-12',
        },
      ])
      const call = (retrieveQuestionResponseFromFormArtifact.retrieveQuestionResponseFromFormArtifact as jest.Mock).mock
        .calls[0]
      expect(call[0]).toEqual(placementApplication)
      expect(call[2]).toEqual('decisionToReleaseDate')
    })
  })
})
