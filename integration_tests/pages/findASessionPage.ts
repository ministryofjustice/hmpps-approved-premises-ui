import Page from './page'
import paths from '../../server/paths'

export default class FindASessionPage extends Page {
  constructor() {
    super('Track progress on Community Payback')
  }

  static visit(): FindASessionPage {
    cy.visit(paths.sessions.index({}))

    return new FindASessionPage()
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Find a session')
    cy.get('label').contains('Region')
    cy.get('label').contains('Team')
    cy.get('legend').contains('From')
    cy.get('legend').contains('To')
  }

  completeSearchForm() {
    cy.get('#startDate-day').type('18')
    cy.get('#startDate-month').type('09')
    cy.get('#startDate-year').type('2025')
    cy.get('#endDate-day').type('20')
    cy.get('#endDate-month').type('09')
    cy.get('#endDate-year').type('2025')
  }

  submitForm() {
    cy.get('button').click()
  }

  clickOnASession() {
    cy.get('a').contains('project-name').click()
  }

  shouldShowSearchResults() {
    cy.get('td').eq(0).should('contain.text', 'project-name')
    cy.get('td').eq(0).should('contain.text', 'prj')
    cy.get('td').eq(1).should('have.text', '7 September 2025')
    cy.get('td').eq(2).should('have.text', '09:00')
    cy.get('td').eq(3).should('have.text', '17:00')
    cy.get('td').eq(4).should('have.text', '5')
    cy.get('td').eq(5).should('have.text', '3')
    cy.get('td').eq(6).should('have.text', '1')
  }

  shouldShowPopulatedSearchForm() {
    cy.get('#startDate-day').should('have.value', '18')
    cy.get('#startDate-month').should('have.value', '09')
    cy.get('#startDate-year').should('have.value', '2025')
    cy.get('#endDate-day').should('have.value', '20')
    cy.get('#endDate-month').should('have.value', '09')
    cy.get('#endDate-year').should('have.value', '2025')
  }
}
