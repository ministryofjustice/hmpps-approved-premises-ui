import paths from '../../../server/paths/people'
import { personFactory, personalTimelineFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { FindPage } from '../../pages/people/timeline/find'
import { ShowPage } from '../../pages/people/timeline/show'

context('Application timeline', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser', { roles: [] })

    // Given I am logged in
    cy.signIn()
  })

  it('shows a timeline for a CRN', () => {
    const timeline = personalTimelineFactory.build()
    const person = personFactory.build()

    cy.task('stubPersonalTimeline', { timeline, person })
    cy.visit(paths.timeline.find({}))

    // Given I am on the timeline find page
    const findPage = Page.verifyOnPage(FindPage, person)

    // When I enter a CRN
    findPage.enterCrn()
    // And click submit
    findPage.clickSubmit()

    // Then I should be on the timeline show page
    const timelinePage = Page.verifyOnPage(ShowPage, timeline, person.crn)
    // And I should see the timeline for that person
    timelinePage.checkForBackButton(paths.timeline.find({}))
  })
})
