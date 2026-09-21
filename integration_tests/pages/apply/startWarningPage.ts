import Page from '../page'

export default class StartPage extends Page {
  constructor() {
    super('Applications for Approved Premises based on accommodation need only will be rejected')
  }

  clickContinue() {
    this.clickLink('Continue')
  }
}
