import { addWeeks } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  Cas1RequestedPlacementPeriod,
  PlacementApplication,
  ReleaseTypeOption,
  SubmitPlacementApplication,
} from '../../@types/shared'

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
import { getSentenceType } from '../placementApplications'

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
  application: Application,
): SubmitPlacementApplication => {
  const { releaseType, sentenceType, situation } = getSentenceType(placementApplication)
  // let reasonForPlacement: PlacementType = 'additional_placement'
  // if (releaseType === 'rotl') reasonForPlacement = 'rotl'
  // if (releaseType === 'paroleDirectedLicence') reasonForPlacement = 'release_following_decision'

  const placementDates = durationAndArrivalDateFromPlacementApplication(placementApplication, releaseType, application)
  return {
    translatedDocument: placementApplication.document,
    // placementType: reasonForPlacement,
    requestedPlacementPeriods: placementDates,
    releaseType,
    sentenceType,
    situationType: situation,
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
    return (datesOfPlacement as Array<DateOfPlacement>).map(({ arrivalDate, duration, isFlexible }) => ({
      arrival: arrivalDate,
      arrivalFlexible: isFlexible === 'yes',
      duration: Number(duration),
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
  reasonForPlacement: ReleaseTypeOption,
  application: Application,
): Array<Cas1RequestedPlacementPeriod> => {
  switch (reasonForPlacement) {
    case 'rotl': {
      return retreivePlacementDatesFromRotlPlacementApplication(placementApplication)
    }
    case 'paroleDirectedLicence': {
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
    default: {
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
  }
}
