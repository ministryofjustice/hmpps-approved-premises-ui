//  Feature: user views home page
//    So that I can navigate to the parts of the service that I need
//    As a user
//    I want to view the cards on the home page
//
//  Scenario: viewing the home page
//      Given I am logged in
//      When I visit the home page
//      Then I see the correct cards
//      And I see the sign out button

import HomePage from '../pages/homePage'
import Page from '../pages/page'

context('Home', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  //  Scenario: viewing the home page
  it('shows the track progress card', () => {
    // Given I am logged in
    cy.signIn()

    //  When I visit the home page
    HomePage.visit()
    const page = Page.verifyOnPage(HomePage)

    //  Then I see the correct cards
    page.shouldShowCards(['track-progress'])

    //  And I see the sign out button
    page.shouldShowSignOutButton()
  })
})
