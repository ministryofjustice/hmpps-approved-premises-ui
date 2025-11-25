import { Cas1ApplicationSummary } from '@approved-premises/api'
import Page from '../page'
import {
  getApplicationsHeading,
  getApplicationTableHeader,
  getApplicationTableRows,
} from '../../../server/utils/applications/manageApplications'
import { applicationKeyDetails } from '../../../server/utils/applications/helpers'

export default class ManageApplicationsPage extends Page {
  constructor(private readonly applications: Array<Cas1ApplicationSummary>) {
    super(getApplicationsHeading(applications))
  }

  verifyApplicationTable() {
    cy.get('table[data-application-table]').within(() => {
      this.shouldContainTableColumns(getApplicationTableHeader().map(({ text }) => text))
      this.shouldContainTableRows(getApplicationTableRows(this.applications, ''))
    })
    this.shouldShowKeyDetails(applicationKeyDetails(this.applications[0]))
  }
}
