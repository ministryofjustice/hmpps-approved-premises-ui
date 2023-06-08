import { PlacementApplication, PlacementType, SubmitPlacementApplication } from '../../@types/shared'
import ReasonForPlacement from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
): SubmitPlacementApplication => {
  const reasonForPlacement = retrieveQuestionResponseFromFormArtifact(
    placementApplication,
    ReasonForPlacement,
    'reason',
  )
  return {
    translatedDocument: placementApplication.document,
    placementType: reasonForPlacement,
    // At a later date we want to support multiple placement dates, but for now we will hard code the first one
    placementDates: [mapPlacementDateForSubmission(placementApplication, reasonForPlacement)],
  }
}

export const mapPlacementDateForSubmission = (
  placementApplication: PlacementApplication,
  reasonForPlacement: PlacementType,
) => {
  switch (reasonForPlacement) {
    case 'rotl':
      return {
        expectedArrival: retrieveQuestionResponseFromFormArtifact(
          placementApplication,
          DatesOfPlacement,
          'arrivalDate',
        ),
        duration: Number(retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'duration')),
      }
    case 'additional_placement':
      return {
        expectedArrival: retrieveQuestionResponseFromFormArtifact(
          placementApplication,
          AdditionalPlacementDetails,
          'arrivalDate',
        ),
        duration: Number(
          retrieveQuestionResponseFromFormArtifact(placementApplication, AdditionalPlacementDetails, 'duration'),
        ),
      }
    default:
      throw new Error(`Unknown reason for placement: ${reasonForPlacement}`)
  }
}
