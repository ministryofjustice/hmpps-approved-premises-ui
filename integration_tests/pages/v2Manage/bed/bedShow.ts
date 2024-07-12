import { BedDetail, ExtendedPremisesSummary, Premises } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class V2BedShowPage extends Page {
  constructor(private readonly bedName: string) {
    super(`Bed ${bedName}`)
  }

  static visit(premisesId: Premises['id'], bed: BedDetail): V2BedShowPage {
    cy.visit(paths.v2Manage.premises.beds.show({ premisesId, bedId: bed.id }))
    return new V2BedShowPage(bed.name)
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
      .should('have.attr', 'href', paths.v2Manage.premises.show({ premisesId: premises.id }))
  }
}
