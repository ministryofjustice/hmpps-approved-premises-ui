import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('displays all services when a user has all permissions required', () => {
    signIn('janitor')

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('timeline')
    dashboardPage.shouldShowCard('assess')
    dashboardPage.shouldShowCard('manage')
    dashboardPage.shouldShowCard('workflow')
    dashboardPage.shouldShowCard('cruDashboard')
    dashboardPage.shouldShowCard('reports')
    dashboardPage.shouldShowCard('userManagement')
    dashboardPage.shouldShowCard('outOfServiceBeds')
  })

  it('only displays the apply and timeline services when someone has no permissions', () => {
    signIn('applicant')

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('timeline')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
    dashboardPage.shouldNotShowCard('workflow')
    dashboardPage.shouldNotShowCard('cruDashboard')
    dashboardPage.shouldNotShowCard('reports')
    dashboardPage.shouldNotShowCard('userManagement')
    dashboardPage.shouldNotShowCard('outOfServiceBeds')
  })
})
