import paths from '../../../server/paths/apply'

import Page from '../page'

export default class WithdrawApplicationPage extends Page {
  constructor() {
    super('Do you want to withdraw this application?')
    this.checkForBackButton(paths.applications.index.pattern)
  }

  clickYes() {
    this.checkRadioByNameAndValue('confirmWithdrawal', 'yes')
  }
}
