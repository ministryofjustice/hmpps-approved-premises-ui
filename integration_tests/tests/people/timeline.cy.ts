import paths from '../../../server/paths/people'
import { applicationTimelineFactory, personFactory, personalTimelineFactory } from '../../../server/testutils/factories'
import Page from '../../pages/page'
import { FindPage } from '../../pages/people/timeline/find'
import { ShowPage } from '../../pages/people/timeline/show'
import { signIn } from '../signIn'

context('Application timeline', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as an applicant
    signIn()
  })
  ;([true, false] as const).forEach(isOfflineApplication => {
    it(`shows the timeline for a CRN if isOfflineApplication is: ${isOfflineApplication}`, () => {
      const person = personFactory.build({ type: 'FullPerson' })
      const applications = applicationTimelineFactory.buildList(2, { isOfflineApplication })
      const timeline = personalTimelineFactory.build({ person, applications })

      cy.task('stubPersonalTimeline', { timeline, person })
      cy.visit(paths.timeline.find({}))

      // Given I am on the timeline find page
      const findPage = Page.verifyOnPage(FindPage, person)

      // When I enter a CRN
      findPage.enterCrn()
      // And click submit
      findPage.clickSubmit()

      // Then I should be on the timeline show page
      const timelinePage = Page.verifyOnPage(ShowPage, timeline, person)
      // And I should see the timeline for that person
      timelinePage.checkForBackButton(paths.timeline.find({}))
      timelinePage.shouldShowTimeline()
      timelinePage.shouldShowPersonDetails(person)
    })

    it('shows the timeline for a Limited access offender', () => {
      const person = personFactory.build({ isRestricted: true })
      const timeline = personalTimelineFactory.build({ person })

      cy.task('stubPersonalTimeline', { timeline, person })
      cy.visit(paths.timeline.find({}))

      // Given I am on the timeline find page
      const findPage = Page.verifyOnPage(FindPage, person)

      // When I enter a CRN
      findPage.enterCrn()
      // And click submit
      findPage.clickSubmit()

      // Then I should be on the timeline show page
      Page.verifyOnPage(ShowPage, timeline, person)
    })
  })
})
