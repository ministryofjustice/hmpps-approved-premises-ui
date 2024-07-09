import { BedDetail, Premises } from '../../../../server/@types/shared'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedDetails } from '../../../../server/utils/bedUtils'

export default class BedShowPage extends Page {
  constructor(private readonly bedName: string) {
    super(`Bed ${bedName}`)
  }

  static visit(premisesId: Premises['id'], bed: BedDetail): BedShowPage {
    cy.visit(paths.v2Manage.premises.beds.show({ premisesId, bedId: bed.id }))
    return new BedShowPage(bed.name)
  }

  shouldShowPremisesName(premisesName: string): void {
    cy.get('span').contains(premisesName)
  }

  shouldShowBedDetails(bed: BedDetail): void {
    cy.get('h1').contains(bed.roomName)
    cy.get('h1').contains(bed.name)
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
