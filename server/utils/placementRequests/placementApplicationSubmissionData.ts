import { addWeeks } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
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

export const retreivePlacementDatesFromRotlPlacementApplication = (
  placementApplication: PlacementApplication,
): Array<DateOfPlacement> => {
  const datesOfPlacement = retrieveOptionalQuestionResponseFromFormArtifact(
    placementApplication,
    DatesOfPlacement,
    'datesOfPlacement',
  )

  if (datesOfPlacement) {
    return datesOfPlacement
  }

  const dateOfPlacement = {} as DateOfPlacement

  const legacyProperties: Array<keyof DateOfPlacement> = [
    'arrivalDate',
    'arrivalDate-day',
    'arrivalDate-month',
    'arrivalDate-year',
    'duration',
    'durationDays',
    'durationWeeks',
  ]

  legacyProperties.forEach(property => {
    dateOfPlacement[property] = retrieveQuestionResponseFromFormArtifact(
      placementApplication,
      DatesOfPlacement,
      property,
    )
  })

  return [dateOfPlacement as DateOfPlacement]
}

export const durationAndArrivalDateFromPlacementApplication = (
  placementApplication: PlacementApplication,
  reasonForPlacement: PlacementType,
  application: Application,
): Array<DatesOfStay> => {
  switch (reasonForPlacement) {
    case 'rotl': {
      return retreivePlacementDatesFromRotlPlacementApplication(placementApplication).map(
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
