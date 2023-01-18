import Page from '../page'

export default class RequestInformationPage extends Page {
  constructor() {
    super('Request information from probation practicioner')
  }

  completeForm() {
    this.completeTextArea('query', 'Note goes here')
  }
}
