import { PlacementApplication, SubmitPlacementApplication } from '../../@types/shared'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import ReasonForPlacement from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
): SubmitPlacementApplication => {
  return {
    translatedDocument: placementApplication.document,
    placementType: retrieveQuestionResponseFromFormArtifact(placementApplication, ReasonForPlacement, 'reason'),
    // At a later date we want to support multiple placement dates, but for now we will hard code the first one
    placementDates: [mapPlacementDateForSubmission(placementApplication)],
  }
}

export const mapPlacementDateForSubmission = (placementApplication: PlacementApplication) => {
  return {
    expectedArrival: retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'arrivalDate'),
    duration: Number(retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'duration')),
  }
}
