import { Cas1BedDetail, Cas1PremisesBedSummary, Premises } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/manage'

import { bedsTableRows } from '../../../../server/utils/bedUtils'

export default class BedsListPage extends Page {
  constructor() {
    super('Manage beds')
  }

  static visit(premisesId: Premises['id']): BedsListPage {
    cy.visit(paths.premises.beds.index({ premisesId }))
    return new BedsListPage()
  }

  shouldShowBeds(beds: Array<Cas1PremisesBedSummary>, premisesId: Premises['id']): void {
    const rows = bedsTableRows(beds, premisesId)
    this.shouldContainTableRows(rows)
    cy.contains(`Showing ${beds.length} beds`)
  }

  filterBeds(): void {
    cy.contains('Step-free').click()
    this.clickButton('Apply filters')
  }

  clickBed(bed: Cas1BedDetail): void {
    cy.get(`a[data-cy-bedid="${bed.id}"]`).click()
  }

  clickManageOutOfServiceBeds(): void {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.get('a').contains('Manage out of service beds').click()
  }

  shouldIncludeLinkToAllPremisesOutOfServiceBeds(premisesId: Premises['id']): void {
    this.clickOpenActionsMenu()
    cy.get(`a[href="${paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' })}"]`).contains(
      'Manage out of service beds',
    )
  }
}
