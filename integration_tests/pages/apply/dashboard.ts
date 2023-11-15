import Page from '../page'
import paths from '../../../server/paths/apply'
import { ApprovedPremisesApplicationSummary } from '../../../server/@types/shared'
import { dashboardTableRows } from '../../../server/utils/applications/utils'
import { shouldShowTableRows } from '../../helpers'

export default class DashboardPage extends Page {
  constructor(private readonly applications: Array<ApprovedPremisesApplicationSummary>) {
    super('Approved Premises applications')
  }

  static visit(applications: Array<ApprovedPremisesApplicationSummary>): DashboardPage {
    cy.visit(paths.applications.dashboard.pattern)

    return new DashboardPage(applications)
  }

  shouldShowApplications(): void {
    shouldShowTableRows(this.applications, dashboardTableRows)
  }
}
