//  Feature: find a project session
//    So that I can report on a person's progress on Community Payback
//    As a case admin
//    I want to find a project session
//
//  Scenario: viewing the 'find a session' page
//      Given I am logged in
//      When I visit the 'find a session' page
//      Then I see the search form

import FindASessionPage from '../pages/findASessionPage'
import Page from '../pages/page'

context('Home', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  //  Scenario: viewing the home page
  it('shows the find a session search form', () => {
    // Given I am logged in
    cy.signIn()

    //  When I visit the 'find a session' page
    cy.task('stubGetTeams', { providerId: '1000', teams: { providers: [{ id: 1, name: 'Team 1' }] } })
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    //  Then I see the search form
    page.shouldShowSearchForm()
  })
})
