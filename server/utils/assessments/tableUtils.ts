import {
  ApprovedPremisesAssessmentSummary as AssessmentSummary,
  FullPerson,
  RestrictedPerson,
} from '@approved-premises/api'
import { AssessmentCurrentTab, TableRow } from '@approved-premises/ui'
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
import { isFullPerson, laoName } from '../personUtils'

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

const assessmentLink = (assessment: AssessmentSummary, person: FullPerson, linkText = '', hiddenText = ''): string => {
  return linkTo(
    paths.assessments.show,
    { id: assessment.id },
    {
      text: linkText || laoName(person),
      hiddenText,
      attributes: { 'data-cy-assessmentId': assessment.id, 'data-cy-applicationId': assessment.applicationId },
    },
  )
}

export const restrictedPersonCell = (person: RestrictedPerson) => {
  return {
    text: `LAO: ${person.crn}`,
  }
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

const linkCell = (assessment: AssessmentSummary, person: FullPerson) => {
  return {
    html: assessmentLink(assessment, person),
  }
}

const prisonCell = (person: FullPerson) => {
  return {
    text: person.prisonName,
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

export const emptyCell = () => ({ text: '' })

const assessmentTable = (activeTab: AssessmentCurrentTab, assessments: Array<AssessmentSummary>) => {
  switch (activeTab) {
    case 'awaiting_response':
      return {
        firstCellIsHeader: true,
        head: [
          {
            text: 'Name',
          },
          {
            text: 'CRN',
          },
          {
            text: 'Tier',
          },
          {
            text: 'Current location',
          },
          {
            text: 'Arrival date',
          },
          {
            text: 'Days since received',
          },

          {
            text: 'Days until assessment due',
          },
          {
            text: 'Status',
          },
        ],
        rows: requestedFurtherInformationTableRows(assessments),
      }
    case 'completed':
      return {
        firstCellIsHeader: true,
        head: [
          {
            text: 'Name',
          },
          {
            text: 'CRN',
          },
          {
            text: 'Tier',
          },
          {
            text: 'Arrival date',
          },
          {
            text: 'Status',
          },
        ],
        rows: completedTableRows(assessments),
      }
    default:
      return {
        firstCellIsHeader: true,
        head: [
          {
            text: 'Name',
          },
          {
            text: 'CRN',
          },
          {
            text: 'Tier',
          },
          {
            text: 'Arrival date',
          },
          {
            text: 'Current location',
          },
          {
            text: 'Days until assessment due',
          },
          {
            text: 'Status',
          },
        ],
        rows: awaitingAssessmentTableRows(assessments),
      }
  }
}

const awaitingAssessmentTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    if (isFullPerson(assessment.person)) {
      rows.push([
        linkCell(assessment, assessment.person),
        crnCell({ crn: assessment.person.crn }),
        tierCell({ tier: assessment.risks.tier }),
        arrivalDateCell(assessment),
        prisonCell(assessment.person),
        daysUntilDueCell(assessment),
        statusCell(assessment),
      ])
    } else {
      rows.push([
        restrictedPersonCell(assessment.person),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ])
    }
  })
  return rows
}

const completedTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    if (isFullPerson(assessment.person)) {
      rows.push([
        linkCell(assessment, assessment.person),
        crnCell({ crn: assessment.person.crn }),
        tierCell({ tier: assessment.risks.tier }),
        arrivalDateCell(assessment),
        statusCell(assessment),
      ])
    } else {
      rows.push([restrictedPersonCell(assessment.person), emptyCell(), emptyCell(), emptyCell(), emptyCell()])
    }
  })

  return rows
}

const requestedFurtherInformationTableRows = (assessments: Array<AssessmentSummary>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  const infoRequestStatusCell = {
    html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`,
  }

  assessments.forEach(assessment => {
    if (isFullPerson(assessment.person)) {
      rows.push([
        linkCell(assessment, assessment.person),
        crnCell({ crn: assessment.person.crn }),
        tierCell({ tier: assessment.risks.tier }),
        prisonCell(assessment.person),
        arrivalDateCell(assessment),
        daysSinceReceivedCell(assessment),
        daysSinceInfoRequestCell(assessment),
        infoRequestStatusCell,
      ])
    } else {
      rows.push([
        restrictedPersonCell(assessment.person),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
        emptyCell(),
      ])
    }
  })

  return rows
}

export {
  getStatus,
  assessmentLink,
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
  assessmentTable,
}
