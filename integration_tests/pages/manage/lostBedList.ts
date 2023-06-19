import type { LostBed } from '@approved-premises/api'
import paths from '../../../server/paths/manage'

import Page from '../page'

export default class LostBedListPage extends Page {
  constructor() {
    super('Manage out of service beds')
  }

  static visit(premisesId: string): LostBedListPage {
    cy.visit(paths.lostBeds.index({ premisesId }))
    return new LostBedListPage()
  }

  shouldShowLostBeds(lostBeds: Array<LostBed>): void {
    lostBeds.forEach((item: LostBed) => {
      cy.get(`[data-cy-lostBedId="${item.id}"]`)
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

  clickManageBed(lostBed): void {
    cy.get(`[data-cy-lostBedId="${lostBed.id}"]`)
      .parent()
      .parent()
      .within(() => {
        cy.get('td').eq(6).contains('Manage').click()
      })
  }
}
