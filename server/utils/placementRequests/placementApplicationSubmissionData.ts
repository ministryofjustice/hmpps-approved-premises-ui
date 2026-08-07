import { addWeeks } from 'date-fns'
import {
  Cas1Application as Application,
  Cas1RequestedPlacementPeriod,
  PlacementApplication,
  ReleaseTypeOption,
  SentenceTypeOption,
  SubmitPlacementApplication,
} from '@approved-premises/api'
import { DataServices } from '@approved-premises/ui'
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

export const placementApplicationSubmissionData = async (
  placementApplication: PlacementApplication,
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<SubmitPlacementApplication> => {
  const { releaseType, sentenceType, situation } = getSentenceType(placementApplication)
  const requestedPlacementPeriods = await durationAndArrivalDateFromPlacementApplication(
    placementApplication,
    sentenceType,
    releaseType,
    application,
    dataServices,
    token,
  )
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

export const durationAndArrivalDateFromPlacementApplication = async (
  placementApplication: PlacementApplication,
  sentenceType: SentenceTypeOption,
  reasonForPlacement: ReleaseTypeOption,
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<Array<Cas1RequestedPlacementPeriod>> => {
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
      const { defaultDurationDays } = await dataServices.applicationService.getPlacementDuration(
        token,
        application.id,
        application.apType,
        sentenceType,
      )
      return [
        {
          arrival: DateFormats.dateObjToIsoDate(addWeeks(DateFormats.isoToDateObj(decisionToReleaseDate), 6)),
          duration: defaultDurationDays,
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
