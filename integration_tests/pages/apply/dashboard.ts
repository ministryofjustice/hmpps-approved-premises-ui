import Page from '../page'
import paths from '../../../server/paths/apply'
import { ApprovedPremisesApplicationStatus, ApprovedPremisesApplicationSummary } from '../../../server/@types/shared'
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
    shouldShowTableRows(dashboardTableRows(this.applications))
  }

  clickRequestForPlacementLink() {
    cy.get('a').contains('Request for placement').click()
  }

  searchByCrnOrName(crnOrName: string): void {
    this.clearAndCompleteTextInputById('crnOrName', crnOrName)
    this.clickSubmit()
  }

  searchByStatus(status: ApprovedPremisesApplicationStatus): void {
    this.getSelectInputByIdAndSelectAnEntry('status', status)
    this.clickSubmit()
  }
}
