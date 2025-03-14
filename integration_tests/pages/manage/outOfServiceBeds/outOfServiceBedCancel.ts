import { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class OutOfServiceBedCancelPage extends Page {
  static visit(premisesId: string, outOfServiceBed: OutOfServiceBed): OutOfServiceBedCancelPage {
    cy.visit(paths.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBed.id, bedId: outOfServiceBed.bed.id }))
    return new OutOfServiceBedCancelPage(outOfServiceBed)
  }

  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Cancel this out of service bed?')
  }

  warningMessageShouldBeShown(): void {
    ;[
      'You are about to cancel an out of service bed record.',
      `Bed: ${this.outOfServiceBed.room.name} ${this.outOfServiceBed.bed.name}`,
      `Start date: ${DateFormats.isoDateToUIDate(this.outOfServiceBed.startDate)}`,
      `End date: ${DateFormats.isoDateToUIDate(this.outOfServiceBed.endDate)}`,
    ].forEach((testString: string) => {
      cy.get('.moj-interruption-card__body').should('contain.text', testString)
    })
  }

  clickDoCancel(): void {
    cy.contains('button[type=submit]', 'Cancel out of service bed').click()
  }
}
