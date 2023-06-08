import { PlacementApplication } from '../../@types/shared'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import { pageDataFromApplicationOrAssessment } from '../../form-pages/utils'
import { addResponseToFormArtifact, addResponsesToFormArtifact } from '../../testutils/addToApplication'
import { placementApplicationFactory } from '../../testutils/factories'
import { mapPlacementDateForSubmission, placementApplicationSubmissionData } from './placementApplicationSubmissionData'

jest.mock('../../form-pages/utils')

describe('placementApplicationSubmissionData', () => {
  it('returns the data in the correct format for submission', () => {
    let placementApplication = placementApplicationFactory.build()
    placementApplication = addResponseToFormArtifact(placementApplication, {
      section: 'request-a-placement',
      page: 'reason-for-placement',
      key: 'reason',
      value: 'rotl',
    }) as PlacementApplication
    placementApplication = addResponsesToFormArtifact(placementApplication, {
      section: 'request-a-placement',
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

    expect(placementApplicationSubmissionData(placementApplication)).toEqual({
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

describe('mapPlacementDateForSubmission', () => {
  it('returns the arrivalDate and duration from the dates-of-placement page if the "reason" is "rotl"', () => {
    let placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
    })
    placementApplication = addResponsesToFormArtifact(placementApplication, {
      section: 'request-a-placement',
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

    expect(mapPlacementDateForSubmission(placementApplication, 'rotl')).toEqual({
      expectedArrival: '2023-01-01',
      duration: 1,
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(DatesOfPlacement, placementApplication)
  })

  it('returns the arrivalDate and duration from the additional-placement-details page if the "reason" is "existingApplication"', () => {
    const placementApplication = placementApplicationFactory.build({
      data: { 'request-a-placement': { 'reason-for-placement': { reason: 'rotl' } } },
    })

    ;(pageDataFromApplicationOrAssessment as jest.Mock).mockReturnValue({
      arrivalDate: '2023-01-01',
      duration: '1',
    })

    expect(mapPlacementDateForSubmission(placementApplication, 'existingApplication')).toEqual({
      expectedArrival: '2023-01-01',
      duration: 1,
    })
    expect(pageDataFromApplicationOrAssessment).toHaveBeenCalledWith(AdditionalPlacementDetails, placementApplication)
  })
})
