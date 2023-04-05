import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import { add, differenceInDays, format } from 'date-fns'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { DateFormats } from '../dateUtils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

const daysSinceReceived = (assessment: Assessment): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)

  return differenceInDays(new Date(), receivedDate)
}

const daysSinceInfoRequest = (assessment: Assessment): number => {
  const lastInfoRequest = assessment.clarificationNotes[assessment.clarificationNotes.length - 1]
  if (!lastInfoRequest) {
    return undefined
  }
  const infoRequestDate = DateFormats.isoToDateObj(lastInfoRequest.createdAt)

  return differenceInDays(new Date(), infoRequestDate)
}

const formatDays = (days: number): string => {
  if (days === undefined) {
    return 'N/A'
  }
  return `${days} Day${days > 1 ? 's' : ''}`
}

const daysUntilDue = (assessment: Assessment): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)
  const dueDate = add(receivedDate, { days: 10 })

  return differenceInDays(dueDate, new Date())
}

const formatDaysUntilDueWithWarning = (assessment: Assessment): string => {
  const days = daysUntilDue(assessment)
  if (days < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="assessments--index__warning">${formatDays(
      days,
    )}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }
  return formatDays(days)
}

const assessmentsApproachingDue = (assessments: Array<Assessment>): number => {
  return assessments.filter(a => daysUntilDue(a) < DUE_DATE_APPROACHING_DAYS_WINDOW).length
}

const formattedArrivalDate = (assessment: Assessment): string => {
  const arrivalDate = arrivalDateFromApplication(assessment.application as Application)
  return format(DateFormats.isoToDateObj(arrivalDate), 'd MMM yyyy')
}

export {
  daysSinceReceived,
  daysSinceInfoRequest,
  formatDays,
  formatDaysUntilDueWithWarning,
  assessmentsApproachingDue,
  formattedArrivalDate,
  daysUntilDue,
}
