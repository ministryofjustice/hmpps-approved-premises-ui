import { ApprovedPremises } from '@approved-premises/api'
import paths from '../../../../server/paths/manage'

import Page from '../../page'

export class OutOfServiceBedPremisesIndexPage extends Page {
  constructor(private readonly premises: ApprovedPremises) {
    super('Out of service beds')
    this.shouldProvideAHeadingLinkBackToPremisesPage()
  }

  static visit(premises: ApprovedPremises): OutOfServiceBedPremisesIndexPage {
    cy.visit(paths.outOfServiceBeds.premisesIndex({ premisesId: premises.id, temporality: 'current' }))
    return new OutOfServiceBedPremisesIndexPage(premises)
  }

  shouldProvideAHeadingLinkBackToPremisesPage(): void {
    cy.get('a')
      .contains(this.premises.name)
      .should('have.attr', 'href', paths.premises.show({ premisesId: this.premises.id }))
  }

  hasCountOfAllResultsMatchingFilter(): void {
    cy.get('.govuk-summary-list__row').should('contain', 'Total out of service beds matching filters')
    cy.get('.govuk-summary-list__row').should('contain', '100 beds')
  }
}
