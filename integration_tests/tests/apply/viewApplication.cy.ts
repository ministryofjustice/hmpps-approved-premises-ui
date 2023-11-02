import { faker } from '@faker-js/faker/locale/en_GB'

import { ListPage, ShowPage } from '../../pages/apply'
import Page from '../../pages/page'
import { setup } from './setup'
import { restrictedPersonFactory, timelineEventFactory } from '../../../server/testutils/factories'

context('show applications', () => {
  beforeEach(setup)

  it('shows a read-only version of the application', function test() {
    // Given I have completed an application
    const timeline = timelineEventFactory.buildList(10)

    const updatedApplication = { ...this.application, status: 'submitted' }
    cy.task('stubApplicationGet', { application: updatedApplication })
    cy.task('stubApplicationTimeline', { applicationId: updatedApplication.id, timeline })
    cy.task('stubApplications', [updatedApplication])

    // And I visit the list page
    const listPage = ListPage.visit([], [updatedApplication], [])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowInProgressApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, updatedApplication)

    // And I should see the application details
    showPage.shouldNotShowOfflineStatus()
    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()

    // When I click on the 'Timeline' tab
    // Then I should see timeline page
    showPage.clickTimelineTab()
    showPage.shouldShowTimeline(timeline)
  })

  it('shows a read-only version of the application when the offender is an LAO', function test() {
    // Given I have completed an application
    const timeline = timelineEventFactory.buildList(10)

    const application = { ...this.application, status: 'submitted', person: restrictedPersonFactory.build() }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplicationTimeline', { applicationId: application.id, timeline })
    cy.task('stubApplications', [application])

    // And I visit the show page
    ShowPage.visit(application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And I should see the application details
    showPage.shouldNotShowOfflineStatus()
    showPage.shouldShowPersonInformation()
    showPage.shouldShowResponses()

    // When I click on the 'Timeline' tab
    // Then I should see timeline page
    showPage.clickTimelineTab()
    showPage.shouldShowTimeline(timeline)
  })

  it('links to an assessment when an application has been assessed', function test() {
    // Given I have completed an application
    const application = {
      ...this.application,
      status: 'submitted',
      assessmentDecision: 'accepted',
      assessmentDecisionDate: '2023-01-01',
      assessmentId: faker.string.uuid(),
    }
    cy.task('stubApplicationGet', { application })
    cy.task('stubApplications', [application])

    // And I visit the list page
    const listPage = ListPage.visit([], [], [application])

    // When I click on the Submitted tab
    listPage.clickSubmittedTab()

    // Then I should see my application
    listPage.shouldShowSubmittedApplications()

    // When I click on my application
    listPage.clickApplication(this.application)

    // Then I should see a read-only version of the application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And I should see details of the assessment
    showPage.shouldShowAssessmentDetails()
  })

  it('should show an offline application', function test() {
    const application = {
      ...this.application,
      type: 'Offline',
      status: undefined,
    }
    cy.task('stubApplicationGet', { application })

    // And I visit the application page
    ShowPage.visit(application)

    // Then I should see a stub application
    const showPage = Page.verifyOnPage(ShowPage, application)

    // And the application should show as offline
    showPage.shouldShowOfflineStatus()

    // And I should see the person information
    showPage.shouldShowPersonInformation()
  })
})
