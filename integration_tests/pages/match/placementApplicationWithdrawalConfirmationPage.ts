import { WithdrawPlacementRequestReason } from '../../../server/@types/shared/models/WithdrawPlacementRequestReason'
import Page from '../page'
import {
  noCapacityReasons,
  placementNoLongerNeededReasons,
  problemInPlacementReasons,
} from '../../../server/utils/applications/withdrawables/withdrawalReasons'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Why is this request for placement being withdrawn?')
  }

  shouldShowAllReasons() {
    const reasons = [placementNoLongerNeededReasons, noCapacityReasons, problemInPlacementReasons].flat()

    cy.get('.govuk-radios__input').each((inputElement, inputElementIndex) =>
      cy.wrap(inputElement).should('have.value', reasons[inputElementIndex]),
    )
  }

  shouldShowReasonsUnrelatedToCapacity() {
    const reasons = [placementNoLongerNeededReasons, problemInPlacementReasons].flat()

    cy.get('.govuk-radios__input').each((inputElement, inputElementIndex) =>
      cy.wrap(inputElement).should('have.value', reasons[inputElementIndex]),
    )
  }

  selectReason(withdrawalReason: WithdrawPlacementRequestReason) {
    this.checkRadioByNameAndValue('reason', withdrawalReason)
  }

  clickConfirm() {
    cy.get('button').contains('Withdraw').click()
  }
}
