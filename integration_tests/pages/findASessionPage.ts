import Page from './page'
import paths from '../../server/paths'

export default class FindASessionPage extends Page {
  constructor() {
    super('Track progress on Community Payback')
  }

  static visit(): FindASessionPage {
    cy.visit(paths.sessions.show({}))

    return new FindASessionPage()
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Find a session')
    cy.get('label').contains('Region')
    cy.get('label').contains('Team')
    cy.get('legend').contains('From')
    cy.get('legend').contains('To')
  }
}
