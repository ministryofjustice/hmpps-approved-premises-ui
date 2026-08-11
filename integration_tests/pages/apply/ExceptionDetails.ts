import Page from '../page'

export default class ExceptionDetailsPage extends Page {
  constructor() {
    super('Exceptional case details')
  }

  completeForm() {
    this.getTextInputByIdAndEnterDetails('managerName', 'Some Manager')
    this.completeDateInputs('agreementDate', '2023-07-01')
    this.completeTextArea('agreementSummary', 'Some Summary Text')
  }
}
