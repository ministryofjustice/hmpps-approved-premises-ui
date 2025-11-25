import type { NewCancellation } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'
import applyPaths from '../../../server/paths/apply'
import { otherCancellationReasonId } from '../../../server/testutils/factories/newCancellation'

export default class CancellationCreatePage extends Page {
  constructor(
    public readonly premisesId: string,
    public readonly placementId: string,
  ) {
    super('Confirm placement to withdraw')
  }

  static visit(premisesId: string, placementId: string): CancellationCreatePage {
    cy.visit(paths.premises.placements.cancellations.new({ premisesId, placementId }))

    return new CancellationCreatePage(premisesId, placementId)
  }

  completeForm(cancellation: NewCancellation): void {
    this.getLegend('Why is this placement being withdrawn?')
    this.checkRadioByNameAndValue('reason', cancellation.reason)

    if (cancellation.reason === otherCancellationReasonId && cancellation.otherReason) {
      this.completeTextArea('otherReason', cancellation.otherReason)
    }

    this.clickSubmit()
  }

  shouldShowBacklinkToPlacement(): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', paths.premises.placements.show({ premisesId: this.premisesId, placementId: this.placementId }))
  }

  shouldShowBackLinkToApplicationWithdraw(applicationId: string): void {
    cy.get('.govuk-back-link')
      .should('have.attr', 'href')
      .and('include', applyPaths.applications.withdrawables.show({ id: applicationId }))
  }
}
