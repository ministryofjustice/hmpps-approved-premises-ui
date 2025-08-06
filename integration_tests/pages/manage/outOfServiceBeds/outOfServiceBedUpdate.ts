import { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

export class OutOfServiceBedUpdatePage extends Page {
  static visit(premisesId: string, outOfServiceBed: OutOfServiceBed): OutOfServiceBedUpdatePage {
    cy.visit(paths.outOfServiceBeds.update({ premisesId, id: outOfServiceBed.id, bedId: outOfServiceBed.bed.id }))
    return new OutOfServiceBedUpdatePage(outOfServiceBed)
  }

  constructor(private readonly outOfServiceBed: OutOfServiceBed) {
    super('Update out of service bed record')
  }

  formShouldBePrepopulated(): void {
    this.dateInputsShouldContainDate('startDate', this.outOfServiceBed.startDate)
    this.dateInputsShouldContainDate('endDate', this.outOfServiceBed.endDate)
    this.shouldBeSelected(this.outOfServiceBed.reason.id)
    if (this.outOfServiceBed.referenceNumber)
      this.verifyTextInputContentsById('referenceNumber', this.outOfServiceBed.referenceNumber)
  }

  completeForm(outOfServiceBedUpdate: OutOfServiceBed): void {
    this.clearAndCompleteDateInputs('startDate', outOfServiceBedUpdate.startDate)
    this.clearAndCompleteDateInputs('endDate', outOfServiceBedUpdate.endDate)
    this.checkRadioByNameAndValue('reason', outOfServiceBedUpdate.reason.id)
    if (outOfServiceBedUpdate.referenceNumber)
      this.clearAndCompleteTextInputById('referenceNumber', outOfServiceBedUpdate.referenceNumber)
    this.completeTextArea('notes', outOfServiceBedUpdate.notes)
  }
}
