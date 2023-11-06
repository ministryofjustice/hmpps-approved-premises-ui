import { addWeeks } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  PlacementApplication,
  PlacementType,
  SubmitPlacementApplication,
} from '../../@types/shared'
import ReasonForPlacement from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import DatesOfPlacement from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import { placementDurationFromApplication } from '../assessments/placementDurationFromApplication'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { DateFormats } from '../dateUtils'

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
  application: Application,
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
    placementDates: [
      durationAndArrivalDateFromPlacementApplication(placementApplication, reasonForPlacement, application),
    ],
  }
}

export const durationAndArrivalDateFromPlacementApplication = (
  placementApplication: PlacementApplication,
  reasonForPlacement: PlacementType,
  application: Application,
) => {
  switch (reasonForPlacement) {
    case 'rotl': {
      return {
        expectedArrival: retrieveQuestionResponseFromFormArtifact(
          placementApplication,
          DatesOfPlacement,
          'arrivalDate',
        ),
        duration: Number(retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'duration')),
      }
    }
    case 'additional_placement': {
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
    }
    case 'release_following_decision': {
      const decisionToReleaseDate = retrieveQuestionResponseFromFormArtifact(
        placementApplication,
        DecisionToRelease,
        'decisionToReleaseDate',
      )

      return {
        expectedArrival: DateFormats.dateObjToIsoDate(addWeeks(DateFormats.isoToDateObj(decisionToReleaseDate), 6)),
        duration: placementDurationFromApplication(application),
      }
    }

    default:
      return {
        expectedArrival: '',
        duration: '',
      }
  }
}
