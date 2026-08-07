import { addWeeks } from 'date-fns'
import {
  Cas1RequestedPlacementPeriod,
  Cas1RequestsForPlacementDurationsCalculationResponseDto,
  PlacementApplication,
  SubmitPlacementApplication,
} from '@approved-premises/api'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import DatesOfPlacement, {
  DateOfPlacement,
} from '../../form-pages/placement-application/request-a-placement/datesOfPlacement'
import AdditionalPlacementDetails from '../../form-pages/placement-application/request-a-placement/additionalPlacementDetails'
import DecisionToRelease from '../../form-pages/placement-application/request-a-placement/decisionToRelease'
import { DateFormats } from '../dateUtils'
import { makeArrayOfType } from '../utils'
import { getSentenceType } from '../placementApplications'

export const placementApplicationSubmissionData = (
  placementApplication: PlacementApplication,
  requestedPlacementPeriods: Array<Cas1RequestedPlacementPeriod>,
): SubmitPlacementApplication => {
  const { releaseType, sentenceType, situation } = getSentenceType(placementApplication)

  return {
    translatedDocument: placementApplication.document,
    requestedPlacementPeriods,
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
    return makeArrayOfType<DateOfPlacement>(datesOfPlacement).map(({ arrivalDate, duration, isFlexible }) => ({
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
  placementDurations: Cas1RequestsForPlacementDurationsCalculationResponseDto,
): Array<Cas1RequestedPlacementPeriod> => {
  const { releaseType } = getSentenceType(placementApplication)

  switch (releaseType) {
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
          duration: placementDurations?.defaultDurationDays,
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
