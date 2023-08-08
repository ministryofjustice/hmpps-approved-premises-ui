import paths from '../../../../server/paths/admin'

import ListPage from './listPage'

export default class SearchPage extends ListPage {
  static visit(): SearchPage {
    cy.visit(paths.admin.placementRequests.search({}))
    return new SearchPage()
  }

  searchForCrn(crn: string): void {
    this.getTextInputByIdAndEnterDetails('crn', crn)
    this.clickSubmit()
  }
}
