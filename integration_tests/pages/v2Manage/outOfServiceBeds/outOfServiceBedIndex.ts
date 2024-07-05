import { Cas1OutOfServiceBed as OutOfServiceBed, Temporality } from '@approved-premises/api'
import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class OutOfServiceBedIndexPage extends Page {
  constructor() {
    super('View out of service beds')
  }

  static visit(temporality: Temporality): OutOfServiceBedIndexPage {
    cy.visit(paths.v2Manage.outOfServiceBeds.index({ temporality }))
    return new OutOfServiceBedIndexPage()
  }

  clickTab(temporality: string): void {
    cy.get('a').contains(temporality).click()
  }

  shouldShowOutOfServiceBeds(outOfServiceBeds: Array<OutOfServiceBed>): void {
    outOfServiceBeds.forEach((item: OutOfServiceBed) => {
      cy.get(`[data-cy-bedId="${item.bed.id}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(item.premises.name)
          cy.get('td').eq(1).contains(item.room.name)
          cy.get('td').eq(2).contains(item.bed.name)
          cy.get('td')
            .eq(3)
            .contains(DateFormats.isoDateToUIDate(item.startDate, { format: 'short' }))
          cy.get('td')
            .eq(4)
            .contains(DateFormats.isoDateToUIDate(item.endDate, { format: 'short' }))
          cy.get('td').eq(5).contains(item.reason.name)
          cy.get('td')
            .eq(6)
            .contains(item.referenceNumber || 'Not provided')
          cy.get('td').eq(7).contains(item.daysLostCount)
          cy.get('td')
            .eq(8)
            .within(() => {
              cy.get('a').should(
                'have.attr',
                'href',
                paths.v2Manage.outOfServiceBeds.show({
                  id: item.id,
                  premisesId: item.premises.id,
                  bedId: item.bed.id,
                  tab: 'details',
                }),
              )
            })
        })
    })
  }
}
