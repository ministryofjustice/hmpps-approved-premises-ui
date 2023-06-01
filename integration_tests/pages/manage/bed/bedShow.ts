import { BedDetail } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class BedShowPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: string, bed: BedDetail): BedShowPage {
    cy.visit(paths.premises.beds.show({ premisesId, bedId: bed.id }))
    return new BedShowPage()
  }

  shouldShowBedDetails(bed: BedDetail): void {
    const details = bedDetails(bed)
    this.shouldContainSummaryListItems(details)
  }

  clickLostBedsOption() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Mark this bed as out of service').click()
  }

  clickCreateBookingOption() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Create a placement').click()
  }
}
