//  Feature: Update a session appointment
//    As a case administrator
//    I want to update an individual appointment for an offender
//    So that I can track progress for an unpaid work order

//  Scenario: Accessing the update appointment form
//    Given I am on a session details page
//    When I click update next for a particular session
//    Then I see the check project details page

//  Scenario: Viewing a session with Limited Access Offenders
//    Given I am viewing a session details page with limited access offenders
//    Then I see limited offender details and no option to update

import CheckProjectDetailsPage from '../pages/appointments/checkProjectDetailsPage'
import Page from '../pages/page'
import ViewSessionPage from '../pages/viewSessionPage'

context('Session details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  //  Scenario: Accessing the update appointment form
  it('shows an option to update an appointment on a session', () => {
    // Given I am on the view session page
    cy.signIn()
    cy.task('stubFindSession', { projectId: '3' })
    const page = ViewSessionPage.visit()
    page.shouldShowAppointmentsList()

    // When I click update for a particular session
    cy.task('stubFindAppointment', { appointmentId: '1001' })
    page.clickUpdateAnAppointment()

    // Then I see the check project details page
    Page.verifyOnPage(CheckProjectDetailsPage)
  })

  //  Scenario: Viewing a session with Limited Access Offenders
  it('does not enable appointment update for a limited access offender', () => {
    // Given I am on the view session page
    cy.signIn()
    cy.task('stubFindSession', { projectId: '3', responseHasLimitedOffenders: true })
    const page = ViewSessionPage.visit()

    // Then I see limited information about offenders and cannot update
    page.shouldShowOffendersWithNoNames()
  })
})
