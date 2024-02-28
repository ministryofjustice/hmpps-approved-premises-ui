import Page from '../page'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesApplicationSummary,
} from '../../../server/@types/shared'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class ListPage extends Page {
  constructor(
    private readonly inProgressApplications: Array<ApprovedPremisesApplicationSummary>,
    private readonly submittedApplications: Array<ApprovedPremisesApplicationSummary>,
    private readonly requestedFurtherInformationApplications: Array<ApprovedPremisesApplicationSummary>,
  ) {
    super('Approved Premises applications')
  }

  static visit(
    inProgressApplications: Array<ApprovedPremisesApplicationSummary>,
    submittedApplications: Array<ApprovedPremisesApplicationSummary>,
    requestedFurtherInformationApplications: Array<ApprovedPremisesApplicationSummary>,
  ): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage(inProgressApplications, submittedApplications, requestedFurtherInformationApplications)
  }

  shouldShowInProgressApplications(): void {
    this.shouldShowApplications(this.inProgressApplications, 'Application started')
  }

  shouldShowFurtherInformationRequestedApplications(): void {
    this.shouldShowApplications(this.requestedFurtherInformationApplications, 'Further information requested')
  }

  shouldShowSubmittedApplications(): void {
    this.shouldShowApplications(this.submittedApplications, 'Application submitted')
  }

  clickRequestForPlacementLink() {
    cy.get('a').contains('Request for placement').click()
  }

  clickSubmit() {
    cy.get('.govuk-button').click()
  }

  clickFurtherInformationRequestedTab() {
    cy.get('a').contains('Further information requested').click()
  }

  clickSubmittedTab() {
    cy.get('a').contains('Submitted').click()
  }

  clickApplication(application: Application) {
    cy.get(`a[data-cy-id="${application.id}"]`).click()
  }

  clickWithdraw() {
    cy.get('a').contains('Withdraw').first().click()
  }

  showsWithdrawalConfirmationMessage() {
    this.shouldShowBanner('Application withdrawn')
  }

  private shouldShowApplications(applications: Array<ApprovedPremisesApplicationSummary>, status: string): void {
    applications.forEach(application => {
      const name = nameOrPlaceholderCopy(application.person)
      cy.contains(name)
        .should('have.attr', 'href', paths.applications.show({ id: application.id }))
        .parent()
        .parent()
        .within(() => {
          cy.get('th').eq(0).contains(name)
          cy.get('td').eq(0).contains(application.person.crn)
          cy.get('td').eq(1).contains(application.risks.tier.value.level)
          cy.get('td')
            .eq(2)
            .contains(
              DateFormats.isoDateToUIDate(application.arrivalDate, {
                format: 'short',
              }),
            )
          cy.get('td').eq(3).contains(status)
        })
    })
  }
}
