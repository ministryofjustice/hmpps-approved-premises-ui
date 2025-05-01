import Page from '../../../page'

export class TransferRequestPage extends Page {
  constructor() {
    super('Request a transfer')
  }

  shouldShowForm() {
    this.getLegend('When does the person need to be transferred?')
  }

  completeForm(date: string) {
    this.clearAndCompleteDateInputs('transferDate', date)
    this.clickContinue()
  }
}
