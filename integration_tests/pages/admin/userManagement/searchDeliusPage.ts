import Page from '../../page'
import paths from '../../../../server/paths/admin'

export default class SearchDeliusPage extends Page {
  constructor() {
    super('Find a new user')
  }

  static visit(): SearchDeliusPage {
    cy.visit(paths.admin.userManagement.new({}))
    return new SearchDeliusPage()
  }

  searchForUser(username: string): void {
    this.getTextInputByIdAndEnterDetails('search-by-delius-username', username)
    this.clickSubmit()
  }
}
