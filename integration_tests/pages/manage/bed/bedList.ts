import { BedDetail, BedSummary, Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedTableRows } from '../../../../server/utils/bedUtils'

export default class BedsListPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: Premises['id']): BedsListPage {
    cy.visit(paths.premises.beds.index({ premisesId }))
    return new BedsListPage()
  }

  shouldShowBeds(beds: Array<BedSummary>, premisesId: Premises['id']): void {
    const rows = bedTableRows(beds, premisesId)
    this.shouldContainTableRows(rows)
  }

  clickBed(bed: BedDetail): void {
    cy.get(`a[data-cy-bedid="${bed.id}"]`).click()
  }

  clickManageOutOfServiceBeds(): void {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Manage out of service beds').click()
  }

  shouldIncludeLinkToAllPremisesOutOfServiceBeds(premisesId: Premises['id']): void {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get(`a[href="${paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' })}"]`).contains(
      'Manage out of service beds',
    )
  }
}
