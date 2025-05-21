import { Cas1ChangeRequestSummary } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/admin'
import { tableRowsToArrays } from '../../../helpers'
import { changeRequestsTableRows } from '../../../../server/utils/placementRequests/changeRequestsUtils'

export default class ChangeRequestsListPage extends Page {
  constructor(pageTitle: string = 'CRU Dashboard') {
    super(pageTitle)
  }

  static visit(): ChangeRequestsListPage {
    cy.visit(paths.admin.cruDashboard.changeRequests({}))
    return new ChangeRequestsListPage()
  }

  static visitUnauthorised() {
    cy.visit(paths.admin.cruDashboard.changeRequests({}), { failOnStatusCode: false })

    return new ChangeRequestsListPage(`Authorisation Error`)
  }

  shouldShowChangeRequests(changeRequests: Array<Cas1ChangeRequestSummary>) {
    const tableRows = changeRequestsTableRows(changeRequests)
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
}
