import { Cas1RequestedPlacementPeriod } from '@approved-premises/api'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { getPageName, pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { applicationFactory, placementApplicationFactory } from '../../testutils/factories'
import { placementDurationFromApplication } from '../applications/placementDurationFromApplication'
import { DateFormats } from '../dateUtils'
import {
  durationAndArrivalDateFromPlacementApplication,
  placementApplicationSubmissionData,
} from './placementApplicationSubmissionData'

jest.mock('../../form-pages/utils')
jest.mock('../applications/placementDurationFromApplication')

describe('placementApplicationSubmissionData', () => {
  const datesOfPlacement = [
    {
      duration: '15',
      durationDays: '15',
      'arrivalDate-year': '2023',
      'arrivalDate-month': '12',
      'arrivalDate-day': '1',
      arrivalDate: '2023-12-01',
      isFlexible: 'yes',
    },
    {
      duration: '23',
      durationDays: '23',
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
    it('returns the data in the correct format for submission', () => {
      const placementApplication = placementApplicationFactory.build()

      ;(
        pageDataFromApplicationOrAssessment as jest.MockedFn<typeof pageDataFromApplicationOrAssessment>
      ).mockReturnValue({
        reason: 'rotl',
        datesOfPlacement,
      })
      ;(getPageName as jest.MockedFn<typeof getPageName>).mockReturnValueOnce('reason')
      ;(getPageName as jest.MockedFn<typeof getPageName>).mockReturnValueOnce('dates-of-placement')

      expect(placementApplicationSubmissionData(placementApplication, applicationFactory.build())).toEqual({
        placementType: 'rotl',
        translatedDocument: {},
        requestedPlacementPeriods: datesOfPlacementForApi,
      })
    })
  })

  describe('durationAndArrivalDateFromPlacementApplication', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('returns the arrivalDate and duration from the dates-of-placement page if the "reason" is "rotl"', () => {
      const placementApplication = placementApplicationFactory.build({
        data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
      })
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
        datesOfPlacement,
      })

      expect(
        durationAndArrivalDateFromPlacementApplication(placementApplication, 'rotl', applicationFactory.build()),
      ).toEqual(datesOfPlacementForApi)
      expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
    })

    it('returns the arrivalDate and duration from the legacy placement dates if the "reason" is "rotl"', () => {
      const placementApplication = placementApplicationFactory.build({
        data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
      })
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
        ...DateFormats.isoDateToDateInputs(datesOfPlacement[0].arrivalDate, 'arrivalDate'),
        duration: datesOfPlacement[0].duration,
        durationDays: datesOfPlacement[0].durationDays,
      })

      expect(
        durationAndArrivalDateFromPlacementApplication(placementApplication, 'rotl', applicationFactory.build()),
      ).toEqual([{ ...datesOfPlacementForApi[0], arrivalFlexible: undefined }])
      expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
    })

    it('returns the arrivalDate and duration from the additional-placement-details page if the "reason" is "additional_placement"', () => {
      const placementApplication = placementApplicationFactory.build({
        data: { 'request-a-placement': { 'reason-for-placement': { reason: 'additional_placement' } } },
      })

      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
        arrivalDate: '2023-01-01',
        duration: '1',
      })

      expect(
        durationAndArrivalDateFromPlacementApplication(
          placementApplication,
          'additional_placement',
          applicationFactory.build(),
        ),
      ).toEqual([
        {
          arrival: '2023-01-01',
          duration: 1,
        },
      ])
      expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(AdditionalPlacementDetails, placementApplication)
    })

    it('calculates the release date to be decision to release date + 6 weeks and retrieves the placement duration from the application if the "reason" is "release_following_decision"', () => {
      const placementApplication = placementApplicationFactory.build({
        data: { 'request-a-placement': { 'reason-for-placement': { reason: 'release_following_decision' } } },
      })
      ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
        decisionToReleaseDate: '2023-01-01',
      })
      ;(placementDurationFromApplication as jest.Mock).mockReturnValue('1')

      expect(
        durationAndArrivalDateFromPlacementApplication(
          placementApplication,
          'release_following_decision',
          applicationFactory.build(),
        ),
      ).toEqual([
        {
          duration: 1,
          arrival: '2023-02-12',
        },
      ])
      expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DecisionToRelease, placementApplication)
    })
  })
})
