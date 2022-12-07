import { TableRow, AssessmentWithRisks } from '@approved-premises/ui'
import { format, differenceInDays, add } from 'date-fns'

import { Assessment } from '@approved-premises/api'
import { tierBadge } from './personUtils'
import { DateFormats } from './dateUtils'
import { getArrivalDate } from './applicationUtils'

const awaitingAssessmentTableRows = (assessments: Array<AssessmentWithRisks>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      {
        html: `<a href="#">${assessment.application.person.name}</a>`,
      },
      {
        html: assessment.application.person.crn,
      },
      {
        html: tierBadge(assessment.application.person.risks.tier.value.level),
      },
      {
        text: formattedArrivalDate(assessment),
      },
      {
        text: assessment.application.person.prisonName,
      },
      {
        text: formatDays(daysUntilDue(assessment)),
      },
      {
        html: getStatus(assessment),
      },
    ])
  })

  return rows
}

const requestedFurtherInformationTableRows = (assessments: Array<AssessmentWithRisks>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      {
        html: `<a href="#">${assessment.application.person.name}</a>`,
      },
      {
        html: assessment.application.person.crn,
      },
      {
        html: tierBadge(assessment.application.person.risks.tier.value.level),
      },
      {
        text: formattedArrivalDate(assessment),
      },
      {
        text: formatDays(daysSinceReceived(assessment)),
      },
      {
        text: formatDays(daysSinceInfoRequest(assessment)),
      },
      {
        html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`,
      },
    ])
  })

  return rows
}

const formattedArrivalDate = (assessment: Assessment): string => {
  const arrivalDate = getArrivalDate(assessment.application)
  return format(DateFormats.isoToDateObj(arrivalDate), 'd MMM yyyy')
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

const getStatus = (assessment: Assessment): string => {
  if (assessment.data) {
    if (!assessment.decision) {
      return `<strong class="govuk-tag govuk-tag--blue">In progress</strong>`
    }
    return `<strong class="govuk-tag govuk-tag">Completed</strong>`
  }
  return `<strong class="govuk-tag govuk-tag--grey">Not started</strong>`
}

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

export {
  awaitingAssessmentTableRows,
  getStatus,
  daysSinceReceived,
  formattedArrivalDate,
  requestedFurtherInformationTableRows,
  daysSinceInfoRequest,
  formatDays,
  daysUntilDue,
}
