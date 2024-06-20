import { BedDetail, Premises } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class BedShowPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: Premises['id'], bed: BedDetail, { v2 } = { v2: false }): BedShowPage {
    cy.visit(
      v2
        ? paths.v2Manage.premises.beds.show({ premisesId, bedId: bed.id })
        : paths.premises.beds.show({ premisesId, bedId: bed.id }),
    )
    return new BedShowPage()
  }

  shouldShowBedDetails(bed: BedDetail): void {
    const details = bedDetails(bed)
    this.shouldContainSummaryListItems(details)
  }

  clickOutOfServiceBedOption() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Create out of service bed record').click()
  }

  clickCreateBookingOption() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Create a placement').click()
  }
}
