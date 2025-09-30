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
import ViewSessionPage from '../pages/viewSessionPage'

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

  //  Scenario: searching for sessions
  it('searches for sessions and displays results', () => {
    // Given I am logged in
    cy.signIn()

    //  When I visit the 'find a session' page
    cy.task('stubGetTeams', { providerId: '1000', teams: { providers: [{ id: 1, name: 'Team 1' }] } })
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)

    // And I complete the search form
    page.completeSearchForm()

    // And I search for sessions
    cy.task('stubGetSessions', {
      request: { teamId: 1, startDate: '2025-09-18', endDate: '2025-09-20', username: 'some-name' },
      sessions: {
        allocations: [
          {
            id: 1001,
            projectId: 3,
            date: '2025-09-07',
            projectName: 'project-name',
            projectCode: 'prj',
            startTime: '09:00:00',
            endTime: '17:00:00',
            numberOfOffendersAllocated: 5,
            numberOfOffendersWithOutcomes: 3,
            numberOfOffendersWithEA: 1,
          },
        ],
      },
    })
    page.submitForm()

    //  Then I see the search results
    page.shouldShowSearchResults()
    page.shouldShowPopulatedSearchForm()
  })

  //  Scenario: viewing a session
  it('lets me view a session from the dashboard', () => {
    // Given I am logged in and on the sessions page
    cy.signIn()
    cy.task('stubGetTeams', { providerId: '1000', teams: { providers: [{ id: 1, name: 'Team 1' }] } })
    FindASessionPage.visit()
    const page = Page.verifyOnPage(FindASessionPage)
    page.completeSearchForm()

    //  When I search for a session
    cy.task('stubGetSessions', {
      request: { teamId: 1, startDate: '2025-09-18', endDate: '2025-09-20', username: 'some-name' },
      sessions: {
        allocations: [
          {
            id: 1001,
            projectId: 3,
            date: '2025-09-07',
            projectName: 'project-name',
            projectCode: 'prj',
            startTime: '09:00:00',
            endTime: '17:00:00',
            numberOfOffendersAllocated: 5,
            numberOfOffendersWithOutcomes: 3,
            numberOfOffendersWithEA: 1,
          },
        ],
      },
    })
    page.submitForm()

    // And I click on a session in the results
    cy.task('stubFindSession', { projectId: '3' })
    page.clickOnASession()

    //  Then I see the session details page
    Page.verifyOnPage(ViewSessionPage)
  })
})
