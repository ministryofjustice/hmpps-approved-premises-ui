import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { BedDetail, Cas1OutOfServiceBed as OutOfServiceBed, Premises } from '../../../../server/@types/shared'
import { sentenceCase } from '../../../../server/utils/utils'

export class OutOfServiceBedShowPage extends Page {
  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Out of service bed record')
  }

  static visit(premisesId: Premises['id'], outOfServiceBed: OutOfServiceBed): OutOfServiceBedShowPage {
    cy.visit(
      paths.v2Manage.outOfServiceBeds.show({
        premisesId,
        id: outOfServiceBed.id,
        bedId: outOfServiceBed.bed.id,
        tab: 'details',
      }),
    )
    return new OutOfServiceBedShowPage(outOfServiceBed)
  }

  shouldShowOutOfServiceBedDetail(): void {
    const latestRevision = this.outOfServiceBed.revisionHistory[0]

    if (latestRevision.startDate) {
      this.assertDefinition('Start date', DateFormats.isoDateToUIDate(latestRevision.startDate, { format: 'long' }))
    }
    if (latestRevision.endDate) {
      this.assertDefinition('End date', DateFormats.isoDateToUIDate(latestRevision.endDate, { format: 'long' }))
    }
    if (latestRevision.reason) this.assertDefinition('Reason', latestRevision.reason.name)
    if (latestRevision.referenceNumber) this.assertDefinition('Reference number', latestRevision.referenceNumber)
    if (latestRevision.notes) this.assertDefinition('Additional information', latestRevision.notes)
  }

  shouldShowCharacteristics(bed: BedDetail): void {
    bed.characteristics.forEach(characteristic => {
      cy.get('li').contains(characteristic.name)
    })
  }

  shouldShowTimeline() {
    const timelineEvents = this.outOfServiceBed.revisionHistory

    cy.get('.moj-timeline').within(() => {
      cy.get('.moj-timeline__item').should('have.length', timelineEvents.length)

      cy.get('.moj-timeline__item').each(($el, i) => {
        cy.wrap($el).within(() => {
          // Revision type(s)
          timelineEvents[i].revisionType.forEach(element => {
            cy.get('.moj-timeline__header').should('contain', sentenceCase(element))
          })

          // Updated by
          if (timelineEvents[i].updatedBy?.name) {
            cy.get('.moj-timeline__header > .moj-timeline__byline').should('contain', timelineEvents[i].updatedBy.name)
          }

          // Date time
          cy.get('time').should('have.attr', { time: timelineEvents[i].updatedAt })
          cy.get('time').should('contain', DateFormats.isoDateTimeToUIDateTime(timelineEvents[i].updatedAt))

          // Revision details
          this.shouldShowOutOfServiceBedDetails(timelineEvents[i])
        })
      })
    })
  }

  shouldShowUpdateConfirmationMessage() {
    this.shouldShowBanner('The out of service bed record has been updated')
  }

  clickTab(tab: 'Details' | 'Timeline'): void {
    cy.get('.moj-sub-navigation__link').contains(tab).click()
  }

  clickUpdateRecord(): void {
    cy.get('a').contains('Update record').click()
  }
}
