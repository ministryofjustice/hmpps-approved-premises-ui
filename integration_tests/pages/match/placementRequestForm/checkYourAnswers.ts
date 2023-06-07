import Page from '../../page'

export default class CheckYourAnswers extends Page {
  constructor() {
    super('Check your answers')
  }

  completeForm() {
    this.checkCheckboxByNameAndValue('confirmation', '1')
  }
}
