import { differenceInDays, format } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  Cas1Assessment as Assessment,
  Cas1AssessmentSummary as AssessmentSummary,
} from '@approved-premises/api'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { pluralize } from '../utils'

const daysSinceReceived = (assessment: AssessmentSummary): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)

  return differenceInDays(new Date(), receivedDate)
}

const daysSinceInfoRequest = (assessment: AssessmentSummary): number => {
  if (!assessment.dateOfInfoRequest) {
    return undefined
  }
  const infoRequestDate = DateFormats.isoToDateObj(assessment.dateOfInfoRequest)

  return differenceInDays(new Date(), infoRequestDate)
}

const formatDays = (days: number): string => {
  if (days === undefined) {
    return 'N/A'
  }
  return pluralize('Day', days)
}

const formattedArrivalDate = (assessment: AssessmentSummary | Assessment): string => {
  let arrivalDate: string

  if ('arrivalDate' in assessment) {
    arrivalDate = assessment.arrivalDate
  } else if ('application' in assessment && arrivalDateFromApplication(assessment.application as Application)) {
    arrivalDate = arrivalDateFromApplication(assessment.application as Application)
  }

  if (!arrivalDate) {
    return 'Not provided'
  }

  return format(DateFormats.isoToDateObj(arrivalDate), 'd MMM yyyy')
}

export { daysSinceReceived, daysSinceInfoRequest, formatDays, formattedArrivalDate }
