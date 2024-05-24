import paths from '../../../../server/paths/manage'

import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { OutOfServiceBed } from '../../../../server/@types/ui'
import { Premises } from '../../../../server/@types/shared'

export class OutOfServiceBedShowPage extends Page {
  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Manage out of service bed')
  }

  static visit(premisesId: Premises['id'], outOfServiceBed: OutOfServiceBed): OutOfServiceBedShowPage {
    cy.visit(paths.v2Manage.outOfServiceBeds.show({ premisesId, id: outOfServiceBed.id, bedId: outOfServiceBed.bedId }))
    return new OutOfServiceBedShowPage(outOfServiceBed)
  }

  shouldShowOutOfServiceBedDetail(): void {
    this.assertDefinition('Room number', this.outOfServiceBed.roomName)
    this.assertDefinition('Bed number', this.outOfServiceBed.bedName)
    this.assertDefinition('Start date', DateFormats.isoDateToUIDate(this.outOfServiceBed.startDate, { format: 'long' }))
    this.assertDefinition('End date', DateFormats.isoDateToUIDate(this.outOfServiceBed.startDate, { format: 'long' }))
    this.assertDefinition('Reference number', this.outOfServiceBed.referenceNumber)
  }

  public completeForm(endDateString: OutOfServiceBed['endDate'], notes: OutOfServiceBed['notes']): void {
    super.completeDateInputs('endDate', endDateString)

    cy.get('textarea[name="notes"]').type(String(notes))
  }

  clickSubmit(): void {
    cy.get('button[name="submit"]').click()
  }

  clickCancel(): void {
    cy.get('button').contains('Cancel out of service bed').click()
  }
}
