import { WithdrawalReason } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'

import Page from '../page'

export default class WithdrawApplicationPage extends Page {
  constructor() {
    super('Why is this application being withdrawn?')
    this.checkForBackButton(paths.applications.index.pattern)
  }

  completeForm(withdrawalReason: WithdrawalReason) {
    this.checkRadioByNameAndValue('reason', withdrawalReason)
  }
}
