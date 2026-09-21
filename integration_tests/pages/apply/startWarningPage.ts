import Page from '../page'

export default class StartPage extends Page {
  constructor() {
    super('Applications to Approved Premises based solely on an accommodation need will be rejected')
  }

  clickContinue() {
    this.clickLink('Continue')
  }
}
