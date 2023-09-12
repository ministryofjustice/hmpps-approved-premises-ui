import { add, differenceInDays, format } from 'date-fns'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
  AssessmentSummary,
} from '@approved-premises/api'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

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
  return `${days} Day${days > 1 ? 's' : ''}`
}

const daysUntilDue = (assessment: AssessmentSummary): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)
  const dueDate = add(receivedDate, { days: 10 })

  return DateFormats.differenceInBusinessDays(dueDate, new Date())
}

const daysToWeeksAndDays = (days: string | number): { days: number; weeks: number } => {
  const daysAsNumber = Number(days)
  const durationWeeks = Math.floor(daysAsNumber / 7)

  return {
    days: daysAsNumber - durationWeeks * 7,
    weeks: durationWeeks,
  }
}

const formatDaysUntilDueWithWarning = (assessment: AssessmentSummary): string => {
  const days = daysUntilDue(assessment)
  if (days < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="assessments--index__warning">${formatDays(
      days,
    )}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }
  return formatDays(days)
}

const assessmentsApproachingDue = (assessments: Array<AssessmentSummary>): number => {
  return assessments.filter(a => daysUntilDue(a) < DUE_DATE_APPROACHING_DAYS_WINDOW).length
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

export {
  daysSinceReceived,
  daysSinceInfoRequest,
  formatDays,
  formatDaysUntilDueWithWarning,
  assessmentsApproachingDue,
  formattedArrivalDate,
  daysUntilDue,
  daysToWeeksAndDays,
}
