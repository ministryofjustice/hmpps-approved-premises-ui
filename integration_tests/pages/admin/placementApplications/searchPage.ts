import { PlacementRequest } from '../../../../server/@types/shared'
import { PlacementRequestDashboardSearchOptions } from '../../../../server/@types/ui'
import paths from '../../../../server/paths/admin'
import { tableRowsToArrays } from '../../../helpers'
import { dashboardTableRows } from '../../../../server/utils/placementRequests/table'

import ListPage from './listPage'

export default class SearchPage extends ListPage {
  static visit(): SearchPage {
    cy.visit(paths.admin.placementRequests.search({}))
    return new SearchPage()
  }

  enterSearchQuery(searchOptions: PlacementRequestDashboardSearchOptions): void {
    this.getTextInputByIdAndEnterDetails('crnOrName', searchOptions.crnOrName)
    this.getSelectInputByIdAndSelectAnEntry('tier', searchOptions.tier)
    this.getSelectInputByIdAndSelectAnEntry('status', searchOptions.status)
    this.getTextInputByIdAndEnterDetails('arrivalDateStart', searchOptions.arrivalDateStart)
    this.getTextInputByIdAndEnterDetails('arrivalDateEnd', searchOptions.arrivalDateEnd)
    this.clickSubmit()
  }

  shouldShowPlacementRequests(placementRequests: Array<PlacementRequest>): void {
    const tableRows = dashboardTableRows(placementRequests, undefined)
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
