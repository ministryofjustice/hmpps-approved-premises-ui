import type { Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { OutOfServiceBed } from '../../../../server/@types/ui'

export class OutOfServiceBedListPage extends Page {
  constructor() {
    super('Manage out of service beds')
  }

  static visit(premisesId: Premises['id']): OutOfServiceBedListPage {
    cy.visit(paths.v2Manage.outOfServiceBeds.index({ premisesId }))
    return new OutOfServiceBedListPage()
  }

  shouldShowOutOfServiceBeds(outOfServiceBeds: Array<OutOfServiceBed>): void {
    outOfServiceBeds.forEach((item: OutOfServiceBed) => {
      cy.get(`[data-cy-bedId="${item.id}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.bedName)
          cy.get('td').eq(1).contains(item.roomName)
          cy.get('td').eq(2).contains(item.startDate)
          cy.get('td').eq(3).contains(item.endDate)
          cy.get('td').eq(4).contains(item.reason.name)
          cy.get('td').eq(5).contains(item.referenceNumber)
        })
    })
  }

  clickManageBed(outOfServiceBed): void {
    cy.get(`[data-cy-bedId="${outOfServiceBed.id}"]`)
      .parent()
      .parent()
      .within(() => {
        cy.get('td').eq(6).contains('Manage').click()
      })
  }
}
