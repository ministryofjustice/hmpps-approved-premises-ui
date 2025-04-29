import Page from '../../../page'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export class TransferRequestPage extends Page {
  constructor() {
    super('Request a transfer')
  }

  shouldShowForm() {
    this.getLegend('When does the person need to be transferred?')
  }

  completeForm(date: Date) {
    this.clearAndCompleteDateInputs('transferDate', DateFormats.dateObjToIsoDate(date))
    this.clickContinue()
  }
}
