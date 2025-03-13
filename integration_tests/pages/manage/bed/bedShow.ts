import { Cas1BedDetail, Cas1Premises, Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class BedShowPage extends Page {
  constructor(readonly bedName: string) {
    super(`Bed ${bedName}`)
  }

  static visit(premisesId: Premises['id'], bed: Cas1BedDetail): BedShowPage {
    cy.visit(paths.premises.beds.show({ premisesId, bedId: bed.id }))
    return new BedShowPage(bed.name)
  }

  shouldShowBedDetails(bed: Cas1BedDetail): void {
    cy.get('.govuk-caption-l').contains(bed.roomName)
    cy.get('h1').contains(bed.name)

    this.shouldContainSummaryListItems(bedDetails(bed).rows)
  }

  shouldLinkToPremises(premises: Cas1Premises): void {
    cy.get('a')
      .contains(premises.name)
      .should('have.attr', 'href', paths.premises.show({ premisesId: premises.id }))
  }
}
