import { Person } from '../../../server/@types/shared'
import Page from '../page'

export default class PduTransferPage extends Page {
  constructor(person: Person) {
    super(`Have you agreed ${person.name}'s transfer/supervision with the receiving PDU?`)
  }

  completeForm() {
    this.checkRadioByNameAndValue('transferStatus', 'yes')
    this.getTextInputByIdAndEnterDetails('probationPractitioner', 'Probation Practicioner')
  }
}
