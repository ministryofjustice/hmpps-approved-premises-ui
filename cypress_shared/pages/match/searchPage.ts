import Page from '../page'
import paths from '../../../server/paths/match'

export default class SearchPage extends Page {
  constructor() {
    super('Find a bed')
  }

  static visit(): SearchPage {
    cy.visit(paths.beds.search({}))
    return new SearchPage()
  }
}
