import Page from '../../page'
import { Cas1OutOfServiceBed as OutOfServiceBed } from '../../../../server/@types/shared'

export class OutOfServiceBedUpdatePage extends Page {
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
}
