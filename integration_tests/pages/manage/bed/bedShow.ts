import { BedDetail, ExtendedPremisesSummary, Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class BedShowPage extends Page {
  constructor(private readonly bedName: string) {
    super(`Bed ${bedName}`)
  }

  static visit(premisesId: Premises['id'], bed: BedDetail): BedShowPage {
    cy.visit(paths.premises.beds.show({ premisesId, bedId: bed.id }))
    return new BedShowPage(bed.name)
  }

  shouldShowBedDetails(bed: BedDetail): void {
    cy.get('h1').contains(bed.roomName)
    cy.get('h1').contains(bed.name)
    const details = bedDetails(bed)
    this.shouldContainSummaryListItems(details)
  }

  shouldLinkToPremises(premises: ExtendedPremisesSummary): void {
    cy.get('a')
      .contains(premises.name)
      .should('have.attr', 'href', paths.premises.show({ premisesId: premises.id }))
  }
}
