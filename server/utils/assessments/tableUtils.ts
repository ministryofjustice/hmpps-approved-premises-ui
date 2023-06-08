import { AssessmentSummary } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { linkTo } from '../utils'
import {
  daysSinceInfoRequest,
  daysSinceReceived,
  formatDays,
  formatDaysUntilDueWithWarning,
  formattedArrivalDate,
} from './dateUtils'
import paths from '../../paths/assess'
import { crnCell, tierCell } from '../tableUtils'

const getStatus = (assessment: AssessmentSummary): string => {
  if (assessment.status === 'completed') {
    if (assessment.decision === 'accepted') return `<strong class="govuk-tag govuk-tag--green">Suitable</strong>`
    if (assessment.decision === 'rejected') return `<strong class="govuk-tag govuk-tag--red">Rejected</strong>`
  }

  if (assessment.status === 'in_progress') {
    return `<strong class="govuk-tag govuk-tag--blue">In progress</strong>`
  }

  return `<strong class="govuk-tag govuk-tag--grey">Not started</strong>`
}

const assessmentLink = (assessment: AssessmentSummary, linkText = '', hiddenText = ''): string => {
  return linkTo(
    paths.assessments.show,
    { id: assessment.id },
    {
      text: linkText || assessment.person.name,
      hiddenText,
      attributes: { 'data-cy-assessmentId': assessment.id },
    },
  )
}

const arrivalDateCell = (assessment: AssessmentSummary) => {
  return {
    text: formattedArrivalDate(assessment),
  }
}

const daysUntilDueCell = (assessment: AssessmentSummary) => {
  return {
    html: formatDaysUntilDueWithWarning(assessment),
  }
}

const statusCell = (assessment: AssessmentSummary) => {
  return {
    html: getStatus(assessment),
  }
}

const linkCell = (assessment: AssessmentSummary) => {
  return {
    html: assessmentLink(assessment),
  }
}

const prisonCell = (assessment: AssessmentSummary) => {
  return {
    text: assessment.person.prisonName,
  }
}

const daysSinceReceivedCell = (assessment: AssessmentSummary) => {
  return {
    text: formatDays(daysSinceReceived(assessment)),
  }
}

const daysSinceInfoRequestCell = (assessment: AssessmentSummary) => {
  return {
    text: formatDays(daysSinceInfoRequest(assessment)),
  }
}

const awaitingAssessmentTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      linkCell(assessment),
      crnCell(assessment),
      tierCell(assessment),
      arrivalDateCell(assessment),
      prisonCell(assessment),
      daysUntilDueCell(assessment),
      statusCell(assessment),
    ])
  })

  return rows
}

const completedTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      linkCell(assessment),
      crnCell(assessment),
      tierCell(assessment),
      arrivalDateCell(assessment),
      statusCell(assessment),
    ])
  })

  return rows
}

const requestedFurtherInformationTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  const infoRequestStatusCell = {
    html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`,
  }

  assessments.forEach(assessment => {
    rows.push([
      linkCell(assessment),
      crnCell(assessment),
      tierCell(assessment),
      arrivalDateCell(assessment),
      daysSinceReceivedCell(assessment),
      daysSinceInfoRequestCell(assessment),
      infoRequestStatusCell,
    ])
  })

  return rows
}

export {
  getStatus,
  assessmentLink,
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
}
