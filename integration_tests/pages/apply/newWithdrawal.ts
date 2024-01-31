import { Withdrawable } from '../../../server/@types/shared'
import matchPaths from '../../../server/paths/match'
import Page from '../page'

export default class SelectWithdrawableTypePage extends Page {
  constructor(heading: 'What do you want to withdraw?' | `Select your ${'booking' | 'placement'}`) {
    super(heading)
  }

  selectType(type: 'placementRequest' | 'booking' | 'application') {
    this.checkRadioByNameAndValue('selectedWithdrawableType', type)
  }

  selectWithdrawable(id: Withdrawable['id']) {
    this.checkRadioByNameAndValue('selectedWithdrawable', id)
  }

  veryifyLink(id: Withdrawable['id'], type: Withdrawable['type']) {
    if (type === 'placement_request') {
      cy.get(`[data-cy-withdrawable-id="${id}"]`).should('have.attr', 'href', matchPaths.placementRequests.show({ id }))
    }
  }
}
