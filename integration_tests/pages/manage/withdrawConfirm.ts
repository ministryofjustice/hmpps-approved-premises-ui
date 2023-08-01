import Page from '../page'

export default class WithdrawConfirmPage extends Page {
  constructor() {
    super('Are you sure you want to withdraw this placement request?')
  }

  completeForm() {
    this.checkRadioByNameAndValue('confirm', 'yes')
  }
}
