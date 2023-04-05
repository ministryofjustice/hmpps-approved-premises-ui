import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { linkTo } from '../utils'
import {
  daysSinceInfoRequest,
  daysSinceReceived,
  formatDays,
  formatDaysUntilDueWithWarning,
  formattedArrivalDate,
} from './dateUtils'
import { tierBadge } from '../personUtils'
import paths from '../../paths/assess'

const getStatus = (assessment: Assessment): string => {
  if (assessment.status === 'completed') {
    if (assessment.decision === 'accepted') return `<strong class="govuk-tag govuk-tag--green">Suitable</strong>`
    if (assessment.decision === 'rejected') return `<strong class="govuk-tag govuk-tag--red">Rejected</strong>`
  }

  if (assessment.data) {
    return `<strong class="govuk-tag govuk-tag--blue">In progress</strong>`
  }

  return `<strong class="govuk-tag govuk-tag--grey">Not started</strong>`
}

const assessmentLink = (assessment: Assessment, linkText = '', hiddenText = ''): string => {
  return linkTo(
    paths.assessments.show,
    { id: assessment.id },
    {
      text: linkText || assessment.application.person.name,
      hiddenText,
      attributes: { 'data-cy-assessmentId': assessment.id },
    },
  )
}

const crnCell = (assessment: Assessment) => {
  return {
    html: assessment.application.person.crn,
  }
}

const arrivalDateCell = (assessment: Assessment) => {
  return {
    text: formattedArrivalDate(assessment),
  }
}

const daysUntilDueCell = (assessment: Assessment) => {
  return {
    html: formatDaysUntilDueWithWarning(assessment),
  }
}

const statusCell = (assessment: Assessment) => {
  return {
    html: getStatus(assessment),
  }
}

const linkCell = (assessment: Assessment) => {
  return {
    html: assessmentLink(assessment),
  }
}

const tierCell = (assessment: Assessment) => {
  return {
    html: tierBadge(assessment.application.risks.tier?.value?.level),
  }
}

const prisonCell = (assessment: Assessment) => {
  return {
    text: assessment.application.person.prisonName,
  }
}

const daysSinceReceivedCell = (assessment: Assessment) => {
  return {
    text: formatDays(daysSinceReceived(assessment)),
  }
}

const daysSinceInfoRequestCell = (assessment: Assessment) => {
  return {
    text: formatDays(daysSinceInfoRequest(assessment)),
  }
}

const awaitingAssessmentTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
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

const completedTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
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

const requestedFurtherInformationTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
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
