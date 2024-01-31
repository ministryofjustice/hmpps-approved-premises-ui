import { PlacementRequestDashboardSearchOptions } from '../../../../server/@types/ui'
import paths from '../../../../server/paths/admin'

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
}
