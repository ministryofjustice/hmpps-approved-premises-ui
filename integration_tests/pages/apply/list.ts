import Page from '../page'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { ApprovedPremisesApplication as Application, Cas1ApplicationSummary } from '../../../server/@types/shared'
import { displayName } from '../../../server/utils/personUtils'

export default class ListPage extends Page {
  constructor(
    private readonly inProgressApplications: Array<Cas1ApplicationSummary>,
    private readonly submittedApplications: Array<Cas1ApplicationSummary>,
    private readonly requestedFurtherInformationApplications: Array<Cas1ApplicationSummary>,
    private readonly inactiveApplications?: Array<Cas1ApplicationSummary>,
  ) {
    super('Approved Premises applications')
  }

  static visit(
    inProgressApplications: Array<Cas1ApplicationSummary>,
    submittedApplications: Array<Cas1ApplicationSummary>,
    requestedFurtherInformationApplications: Array<Cas1ApplicationSummary>,
    inactiveApplications?: Array<Cas1ApplicationSummary>,
  ): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage(
      inProgressApplications,
      submittedApplications,
      requestedFurtherInformationApplications,
      inactiveApplications,
    )
  }

  shouldShowInProgressApplications(): void {
    this.shouldShowApplications(this.inProgressApplications, 'Not submitted')
  }

  shouldShowFurtherInformationRequestedApplications(): void {
    this.shouldShowApplications(this.requestedFurtherInformationApplications, 'Further information requested')
  }

  shouldShowSubmittedApplications(): void {
    this.shouldShowApplications(this.submittedApplications, 'Awaiting assessment')
  }

  shouldShowInactiveApplications(): void {
    this.shouldShowApplications(this.inactiveApplications, /Expired application|Application withdrawn/)
  }

  clickRequestForPlacementLink() {
    cy.get('a').contains('Create request for placement').click()
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

  clickInactiveTab() {
    cy.get('a').contains('Inactive').click()
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

  private shouldShowApplications(applications: Array<Cas1ApplicationSummary>, status: string | RegExp): void {
    applications.forEach(application => {
      const name = displayName(application.person)
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
          cy.get('td')
            .eq(3)
            .contains(
              DateFormats.isoDateToUIDate(application.createdAt, {
                format: 'short',
              }),
            )
          cy.get('td').eq(4).contains(status)
        })
    })
  }
}
