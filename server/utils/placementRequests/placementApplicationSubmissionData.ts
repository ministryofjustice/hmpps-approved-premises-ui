import { addWeeks } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  Cas1RequestedPlacementPeriod,
  PlacementApplication,
  PlacementType,
  SubmitPlacementApplication,
} from '../../@types/shared'
import ReasonForPlacement from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import DatesOfPlacement, {
  DateOfPlacement,
} from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import { placementDurationFromApplication } from '../applications/placementDurationFromApplication'
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

  const placementDates = durationAndArrivalDateFromPlacementApplication(
    placementApplication,
    reasonForPlacement,
    application,
  )
  return {
    translatedDocument: placementApplication.document,
    placementType: reasonForPlacement,
    requestedPlacementPeriods: placementDates,
  }
}
export const retreivePlacementDatesFromRotlPlacementApplication = (
  placementApplication: PlacementApplication,
): Array<Cas1RequestedPlacementPeriod> => {
  const datesOfPlacement = retrieveOptionalQuestionResponseFromFormArtifact(
    placementApplication,
    DatesOfPlacement,
    'datesOfPlacement',
  )

  if (datesOfPlacement) {
    return (datesOfPlacement as Array<DateOfPlacement>).map(({ arrivalDate, durationDays, isFlexible }) => ({
      arrival: arrivalDate,
      arrivalFlexible: isFlexible === 'yes',
      duration: Number(durationDays),
    }))
  }

  const dateOfPlacement: Cas1RequestedPlacementPeriod = {
    arrival: retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'arrivalDate'),
    arrivalFlexible: undefined,
    duration: Number(retrieveQuestionResponseFromFormArtifact(placementApplication, DatesOfPlacement, 'duration')),
  }

  return [dateOfPlacement]
}

export const durationAndArrivalDateFromPlacementApplication = (
  placementApplication: PlacementApplication,
  reasonForPlacement: PlacementType,
  application: Application,
): Array<Cas1RequestedPlacementPeriod> => {
  switch (reasonForPlacement) {
    case 'rotl': {
      return retreivePlacementDatesFromRotlPlacementApplication(placementApplication)
    }
    case 'additional_placement': {
      return [
        {
          arrival: retrieveQuestionResponseFromFormArtifact(
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
          arrival: DateFormats.dateObjToIsoDate(addWeeks(DateFormats.isoToDateObj(decisionToReleaseDate), 6)),
          duration: Number(placementDurationFromApplication(application)),
        },
      ]
    }

    default:
      return [
        {
          arrival: '',
          duration: null,
        },
      ]
  }
}
