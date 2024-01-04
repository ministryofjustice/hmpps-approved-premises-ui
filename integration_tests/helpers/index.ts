import { add } from 'date-fns'
import {
  AnyValue,
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  ApprovedPremisesUserRole as UserRole,
} from '@approved-premises/api'
import { TableCell, TableRow } from '@approved-premises/ui'

import { DateFormats } from '../../server/utils/dateUtils'

const roshSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['offence-details']
    .offenceDetailsSummaries as ArrayOfOASysOffenceDetailsQuestions
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysSupportingInformationQuestions => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysSupportingInformationQuestions
}

const riskManagementPlanFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskManagementPlanQuestions => {
  return application.data['oasys-import']['risk-management-plan']
    .riskManagementSummaries as ArrayOfOASysRiskManagementPlanQuestions
}

const riskToSelfSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskToSelfQuestions => {
  return application.data['oasys-import']['risk-to-self'].riskToSelfSummaries as ArrayOfOASysRiskToSelfQuestions
}

const tableRowsToArrays = (tableRows: Array<TableRow>): Array<Array<string>> => {
  return tableRows.map(row => Object.keys(row).map(i => uiObjectValue(row[i])))
}

const uiObjectValue = (tableCell: TableCell) => {
  if ('html' in tableCell) {
    return Cypress.$(tableCell.html).text()
  }

  if ('text' in tableCell) {
    return tableCell.text
  }

  return ''
}

const shouldShowTableRows = (tableRows: Array<TableRow>): void => {
  const rowItems = tableRowsToArrays(tableRows)

  rowItems.forEach(columns => {
    const headerCell = columns.shift()
    cy.contains('th', headerCell)
      .parent('tr')
      .within(() => {
        columns.forEach((e, i) => {
          cy.get('td').eq(i).invoke('text').should('contain', e)
        })
      })
  })
}

const updateApplicationReleaseDate = (data: AnyValue) => {
  const releaseDate = add(new Date(), { months: 6 })

  return {
    ...data,
    'basic-information': {
      ...data['basic-information'],
      'release-date': {
        ...DateFormats.dateObjectToDateInputs(releaseDate, 'releaseDate'),
        knowReleaseDate: 'yes',
      },
      'placement-date': { startDateSameAsReleaseDate: 'yes' },
    },
  }
}

const signInWithRoles = (roles: Array<UserRole>) => {
  cy.task('stubAuthUser', { roles })
  cy.signIn()
}

export {
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  tableRowsToArrays,
  updateApplicationReleaseDate,
  shouldShowTableRows,
  uiObjectValue,
  signInWithRoles,
}
