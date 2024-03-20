import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    signIn(['workflow_manager'])
  })

  it('displays all services when a user has all roles', () => {
    const dashboardPage = DashboardPage.visit()

    dashboardPage.clickFeedbackBanner()

    dashboardPage.shouldShowFeedbackPage()
  })
})
