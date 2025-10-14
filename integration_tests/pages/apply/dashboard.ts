import { Cas1ApplicationSummary } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/apply'
import { ApplicationStatusForFilter, dashboardTableRows } from '../../../server/utils/applications/utils'
import { shouldShowTableRows } from '../../helpers'

export default class DashboardPage extends Page {
  constructor(private readonly applications: Array<Cas1ApplicationSummary>) {
    super('Approved Premises applications')
  }

  static visit(applications: Array<Cas1ApplicationSummary>): DashboardPage {
    cy.visit(paths.applications.dashboard.pattern)

    return new DashboardPage(applications)
  }

  shouldShowApplications(): void {
    shouldShowTableRows(dashboardTableRows(this.applications))
  }

  clickRequestForPlacementLink() {
    this.clickLink('Create placement request')
  }

  searchByCrnOrName(crnOrName: string): void {
    this.clearAndCompleteTextInputById('crnOrName', crnOrName)
    this.clickSubmit()
  }

  searchByStatus(status: ApplicationStatusForFilter): void {
    this.getSelectInputByIdAndSelectAnEntry('status', status.toString())
    this.clickSubmit()
  }

  shouldContainPlacementRequestTab() {
    cy.get('a').contains('Placement requests')
  }
}
