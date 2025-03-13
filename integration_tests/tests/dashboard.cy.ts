import DashboardPage from '../pages/dashboard'
import { signIn } from './signIn'

context('Dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
  })

  it('displays all services when a user has all permissions required', () => {
    signIn({
      permissions: [
        'cas1_view_assigned_assessments',
        'cas1_view_manage_tasks',
        'cas1_view_cru_dashboard',
        'cas1_view_out_of_service_beds',
        'cas1_premises_view',
        'cas1_reports_view',
        'cas1_user_management',
      ],
    })

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
    signIn()

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
