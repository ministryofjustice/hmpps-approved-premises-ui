import { WithdrawPlacementRequestReason } from '../../../server/@types/shared/models/WithdrawPlacementRequestReason'
import Page from '../page'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Why is this request for placement being withdrawn?')
  }

  selectReason(withdrawalReason: WithdrawPlacementRequestReason) {
    this.checkRadioByNameAndValue('reason', withdrawalReason)
  }

  clickConfirm() {
    cy.get('button').contains('Withdraw').click()
  }
}
