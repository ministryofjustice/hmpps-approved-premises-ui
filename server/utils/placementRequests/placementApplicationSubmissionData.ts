import { addWeeks } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  PlacementApplication,
  PlacementType,
  SubmitPlacementApplication,
} from '../../@types/shared'
import ReasonForPlacement from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import DatesOfPlacement, {
  DateOfPlacement,
} from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import { placementDurationFromApplication } from '../assessments/placementDurationFromApplication'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { DateFormats } from '../dateUtils'

type DatesOfStay = {
  expectedArrival: string
  duration: number | null
}

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
  application: Application,
): SubmitPlacementApplication => {
  const reasonForPlacement = retrieveQuestionResponseFromFormArtifact(
    placementApplication,
    ReasonForPlacement,
    'reason',
  )

  const placementDates = durationAndArrivalDateFromPlacementApplication(
    placementApplication,
    reasonForPlacement,
    application,
  )
  return {
    translatedDocument: placementApplication.document,
    placementType: reasonForPlacement,
    placementDates: Array.isArray(placementDates) ? placementDates : [placementDates],
  }
}

export const durationAndArrivalDateFromRotlPlacementApplication = (dateOfPlacement: DateOfPlacement): DatesOfStay => {
  return {
    expectedArrival: dateOfPlacement.arrivalDate,
    duration: Number(dateOfPlacement.duration),
  }
}

export const durationAndArrivalDateFromPlacementApplication = (
  placementApplication: PlacementApplication,
  reasonForPlacement: PlacementType,
  application: Application,
): Array<DatesOfStay> => {
  switch (reasonForPlacement) {
    case 'rotl': {
      return retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'datesOfPlacement').map(
        durationAndArrivalDateFromRotlPlacementApplication,
      )
    }
    case 'additional_placement': {
      return [
        {
          expectedArrival: retrieveQuestionResponseFromFormArtifact(
            placementApplication,
            AdditionalPlacementDetails,
            'arrivalDate',
          ),
          duration: Number(
            retrieveQuestionResponseFromFormArtifact(placementApplication, AdditionalPlacementDetails, 'duration'),
          ),
        },
      ]
    }
    case 'release_following_decision': {
      const decisionToReleaseDate = retrieveQuestionResponseFromFormArtifact(
        placementApplication,
        DecisionToRelease,
        'decisionToReleaseDate',
      )

      return [
        {
          expectedArrival: DateFormats.dateObjToIsoDate(addWeeks(DateFormats.isoToDateObj(decisionToReleaseDate), 6)),
          duration: Number(placementDurationFromApplication(application)),
        },
      ]
    }

    default:
      return [
        {
          expectedArrival: '',
          duration: null,
        },
      ]
  }
}
