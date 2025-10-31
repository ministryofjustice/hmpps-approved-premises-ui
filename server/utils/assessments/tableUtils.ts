import {
  AssessmentSortField,
  Cas1AssessmentSummary as AssessmentSummary,
  FullPerson,
  RestrictedPerson,
  SortDirection,
} from '@approved-premises/api'
import { AssessmentCurrentTab, TableRow } from '@approved-premises/ui'
import { linkTo } from '../utils'
import { daysSinceInfoRequest, daysSinceReceived, formatDays, formattedArrivalDate } from './dateUtils'
import paths from '../../paths/assess'
import { crnCell, daysUntilDueCell, tierCell } from '../tableUtils'
import { displayName, isFullPerson } from '../personUtils'
import { sortHeader } from '../sortHeader'
import { AssessmentStatusTag } from './statusTag'

const assessmentLink = (assessment: AssessmentSummary, person: FullPerson, linkText = '', hiddenText = ''): string => {
  return linkTo(paths.assessments.show({ id: assessment.id }), {
    text: linkText || displayName(person),
    hiddenText,
    attributes: { 'data-cy-assessmentId': assessment.id, 'data-cy-applicationId': assessment.applicationId },
  })
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

const statusCell = (assessment: AssessmentSummary) => {
  return {
    html: new AssessmentStatusTag(assessment.status, assessment.decision).html(),
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

const assessmentTable = (
  activeTab: AssessmentCurrentTab,
  assessments: Array<AssessmentSummary>,
  sortBy: AssessmentSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
) => {
  switch (activeTab) {
    case 'awaiting_response':
      return {
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          {
            text: 'Current location',
          },
          sortHeader<AssessmentSortField>('Arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Days since received',
          },
          sortHeader<AssessmentSortField>('Days until assessment due', 'dueAt', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
        ],
        rows: requestedFurtherInformationTableRows(assessments),
      }
    case 'completed':
      return {
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          sortHeader<AssessmentSortField>('Arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
        ],
        rows: completedTableRows(assessments),
      }
    default:
      return {
        firstCellIsHeader: true,
        head: [
          sortHeader<AssessmentSortField>('Name', 'name', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('CRN', 'crn', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Tier',
          },
          sortHeader<AssessmentSortField>('Arrival date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
          {
            text: 'Current location',
          },
          sortHeader<AssessmentSortField>('Days until assessment due', 'dueAt', sortBy, sortDirection, hrefPrefix),
          sortHeader<AssessmentSortField>('Status', 'status', sortBy, sortDirection, hrefPrefix),
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
        tierCell(assessment.risks.tier?.value?.level),
        arrivalDateCell(assessment),
        prisonCell(assessment.person),
        daysUntilDueCell(assessment, 'assessments--index__warning'),
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
        tierCell(assessment.risks.tier?.value?.level),
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
        tierCell(assessment.risks.tier?.value?.level),
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
  assessmentLink,
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
  assessmentTable,
}
