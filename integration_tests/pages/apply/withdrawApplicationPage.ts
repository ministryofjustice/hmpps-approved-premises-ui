import { WithdrawalReason } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'

import Page from '../page'

export default class WithdrawApplicationPage extends Page {
  constructor() {
    super('Why is this application being withdrawn?')
    this.checkForBackButton(paths.applications.index.pattern)
  }

  completeForm<T extends WithdrawalReason>(withdrawalReason: T, otherReason: T extends 'other' ? string : never) {
    this.checkRadioByNameAndValue('reason', withdrawalReason)
    this.getTextInputByIdAndEnterDetails('otherReason', otherReason)
  }
}
