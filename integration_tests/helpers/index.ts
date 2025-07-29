import { add } from 'date-fns'
import {
  ApprovedPremisesApplication,
  Cas1Application,
  OASysQuestion,
  OASysSupportingInformationQuestion,
} from '@approved-premises/api'
import { TableCell, TableRow } from '@approved-premises/ui'

import { DateFormats } from '../../server/utils/dateUtils'

const offenceDetailSummariesFromApplication = (application: ApprovedPremisesApplication): Array<OASysQuestion> => {
  return application.data['oasys-import']['offence-details'].offenceDetailsSummaries as Array<OASysQuestion>
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): Array<OASysSupportingInformationQuestion> => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as Array<OASysSupportingInformationQuestion>
}

const riskManagementPlanFromApplication = (application: ApprovedPremisesApplication): Array<OASysQuestion> => {
  return application.data['oasys-import']['risk-management-plan'].riskManagementSummaries as Array<OASysQuestion>
}

const riskToSelfSummariesFromApplication = (application: ApprovedPremisesApplication): Array<OASysQuestion> => {
  return application.data['oasys-import']['risk-to-self'].riskToSelfSummaries as Array<OASysQuestion>
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

const updateApplicationReleaseDate = (data: Cas1Application['data']): Cas1Application['data'] => {
  const releaseDate = add(new Date(), { months: 7 })

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

const GIVEN = (comment: string) => cy.log(`** GIVEN ${comment}`)
const WHEN = (comment: string) => cy.log(`** WHEN ${comment}`)
const THEN = (comment: string) => cy.log(`** THEN ${comment}`)
const AND = (comment: string) => cy.log(`** AND ${comment}`)

export {
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  tableRowsToArrays,
  updateApplicationReleaseDate,
  shouldShowTableRows,
  uiObjectValue,
  GIVEN,
  WHEN,
  THEN,
  AND,
}
