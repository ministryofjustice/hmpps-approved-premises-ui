import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { Cas1OutOfServiceBed as OutOfServiceBed, Premises } from '../../../../server/@types/shared'

export class OutOfServiceBedShowPage extends Page {
  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Manage out of service bed')
  }

  static visit(premisesId: Premises['id'], outOfServiceBed: OutOfServiceBed): OutOfServiceBedShowPage {
    cy.visit(
      paths.v2Manage.outOfServiceBeds.show({ premisesId, id: outOfServiceBed.id, bedId: outOfServiceBed.bed.id }),
    )
    return new OutOfServiceBedShowPage(outOfServiceBed)
  }

  shouldShowOutOfServiceBedDetail(): void {
    this.assertDefinition('Room number', this.outOfServiceBed.room.name)
    this.assertDefinition('Bed number', this.outOfServiceBed.bed.name)
    this.assertDefinition(
      'Out of service from',
      DateFormats.isoDateToUIDate(this.outOfServiceBed.outOfServiceFrom, { format: 'long' }),
    )
    this.assertDefinition(
      'Out of service to',
      DateFormats.isoDateToUIDate(this.outOfServiceBed.outOfServiceTo, { format: 'long' }),
    )
    if (this.outOfServiceBed.referenceNumber) {
      this.assertDefinition('Reference number', this.outOfServiceBed.referenceNumber)
    }
  }

  public completeForm(endDateString: OutOfServiceBed['outOfServiceTo'], notes: OutOfServiceBed['notes']): void {
    super.completeDateInputs('outOfServiceTo', endDateString)

    cy.get('textarea[name="notes"]').type(String(notes))
  }

  clickSubmit(): void {
    cy.get('button[name="submit"]').click()
  }

  clickCancel(): void {
    cy.get('button').contains('Cancel out of service bed').click()
  }
}
