import { PlacementApplication } from '../../@types/shared'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../testutils/addToApplication'
import { applicationFactory, placementApplicationFactory } from '../../testutils/factories'
import { placementDurationFromApplication } from '../assessments/placementDurationFromApplication'
import {
  durationAndArrivalDateFromPlacementApplication,
  placementApplicationSubmissionData,
} from './placementApplicationSubmissionData'

jest.mock('../../form-pages/utils')
jest.mock('../../utils/assessments/placementDurationFromApplication')

describe('placementApplicationSubmissionData', () => {
  it('returns the data in the correct format for submission', () => {
    let placementApplication = placementApplicationFactory.build()

    placementApplication = addResponseToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'reason-for-placement',
      key: 'reason',
      value: 'rotl',
    }) as PlacementApplication
    placementApplication = addResponsesToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'dates-of-placement',
      keyValuePairs: {
        arrivalDate: '2023-01-01',
        duration: '1',
      },
    }) as PlacementApplication
    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      reason: 'rotl',
      duration: '1',
      arrivalDate: '2023-01-01',
    })

    expect(placementApplicationSubmissionData(placementApplication, applicationFactory.build())).toEqual({
      placementType: 'rotl',
      translatedDocument: {},
      placementDates: [
        {
          expectedArrival: '2023-01-01',
          duration: 1,
        },
      ],
    })
  })
})

describe('durationAndArrivalDateFromPlacementApplication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the arrivalDate and duration from the dates-of-placement page if the "reason" is "rotl"', () => {
    let placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
    })
    placementApplication = addResponsesToFormArtifact(placementApplication, {
      task: 'request-a-placement',
      page: 'dates-of-placement',
      keyValuePairs: {
        arrivalDate: '2023-01-01',
        duration: '1',
      },
    }) as PlacementApplication
    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      arrivalDate: '2023-01-01',
      duration: '1',
    })

    expect(
      durationAndArrivalDateFromPlacementApplication(placementApplication, 'rotl', applicationFactory.build()),
    ).toEqual({
      expectedArrival: '2023-01-01',
      duration: 1,
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
  })

  it('returns the arrivalDate and duration from the additional-placement-details page if the "reason" is "additional_placement"', () => {
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
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
    ).toEqual({
      expectedArrival: '2023-01-01',
      duration: 1,
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(AdditionalPlacementDetails, placementApplication)
  })

  it('calculates the release date to be decision to release date + 6 weeks and retrieves the placement duration from the application if the "reason" is "release_following_decision"', () => {
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'release_following_decision' } } },
    })

    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      decisionToReleaseDate: '2023-01-01',
      duration: '1',
    })
    ;(placementDurationFromApplication as jest.Mock).mockReturnValue('1')

    expect(
      durationAndArrivalDateFromPlacementApplication(
        placementApplication,
        'release_following_decision',
        applicationFactory.build(),
      ),
    ).toEqual({
      duration: '1',
      expectedArrival: '2023-02-12',
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DecisionToRelease, placementApplication)
  })
})
