import { WithdrawPlacementRequestReason } from '../../../server/@types/shared/models/WithdrawPlacementRequestReason'
import Page from '../page'

export default class WithdrawConfirmPage extends Page {
  constructor() {
    super('Are you sure you want to withdraw this placement request?')
  }

  completeForm(reason: WithdrawPlacementRequestReason) {
    this.checkRadioByNameAndValue('reason', reason)
  }
}
