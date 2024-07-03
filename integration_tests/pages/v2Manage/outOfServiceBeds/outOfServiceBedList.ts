import type { Cas1OutOfServiceBed as OutOfServiceBed, Premises, Temporality } from '@approved-premises/api'
import paths from '../../../../server/paths/manage'

import Page from '../../page'

export class OutOfServiceBedListPage extends Page {
  constructor() {
    super('Manage out of service beds')
  }

  static visit(premisesId: Premises['id'], temporality: Temporality): OutOfServiceBedListPage {
    cy.visit(paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId, temporality }))
    return new OutOfServiceBedListPage()
  }

  shouldShowOutOfServiceBeds(outOfServiceBeds: Array<OutOfServiceBed>): void {
    outOfServiceBeds.forEach((item: OutOfServiceBed) => {
      cy.get(`[data-cy-bedId="${item.bed.id}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.bed.name)
          cy.get('td').eq(1).contains(item.room.name)
          cy.get('td').eq(2).contains(item.startDate)
          cy.get('td').eq(3).contains(item.endDate)
          cy.get('td').eq(4).contains(item.reason.name)
          cy.get('td')
            .eq(5)
            .contains(item.referenceNumber || 'Not provided')
        })
    })
  }

  clickManageBed(outOfServiceBed): void {
    cy.get(`[data-cy-bedId="${outOfServiceBed.bed.id}"]`)
      .parent()
      .parent()
      .within(() => {
        cy.get('td').eq(6).contains('View').click()
      })
  }
}
