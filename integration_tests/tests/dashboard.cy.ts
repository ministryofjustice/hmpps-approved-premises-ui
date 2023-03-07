import { signInWithRoles } from '../../cypress_shared/helpers'
import DashboardPage from '../../cypress_shared/pages/dashboard'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
  })

  it('displays all services when a user has all roles', () => {
    signInWithRoles(['assessor', 'applicant', 'manager'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')
    dashboardPage.shouldShowCard('assess')
    dashboardPage.shouldShowCard('manage')
  })

  it('only displays the assess service to assessors', () => {
    signInWithRoles(['assessor'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('assess')

    dashboardPage.shouldNotShowCard('apply')
    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the apply service to applicants', () => {
    signInWithRoles(['applicant'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('apply')

    dashboardPage.shouldNotShowCard('assess')
    dashboardPage.shouldNotShowCard('manage')
  })

  it('only displays the manage service to managers', () => {
    signInWithRoles(['manager'])

    const dashboardPage = DashboardPage.visit()

    dashboardPage.shouldShowCard('manage')

    dashboardPage.shouldNotShowCard('apply')
    dashboardPage.shouldNotShowCard('assess')
  })
})
