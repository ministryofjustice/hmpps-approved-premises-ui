import { Withdrawable } from '../../../server/@types/shared'
import matchPaths from '../../../server/paths/match'
import { SelectedWithdrawableType } from '../../../server/utils/applications/withdrawables'
import Page, { parseHtml } from '../page'

export default class SelectWithdrawableTypePage extends Page {
  constructor(heading: 'What do you want to withdraw?' | 'Select your placement') {
    super(heading)
  }

  shouldShowWithdrawableGuidance() {
    cy.get('.govuk-inset-text').then(insetTextElement => {
      const { actual, expected } = parseHtml(
        insetTextElement,
        'Only one date can be withdrawn at a time. Please contact the CRU if you do not see a date you are expecting to be able to withdraw.',
      )

      expect(actual).to.equal(expected)
    })
  }

  shouldShowWithdrawableTypes(types: Array<SelectedWithdrawableType>) {
    types.forEach(type => {
      cy.get(`input[value="${type}"]`).should('exist')
    })
  }

  shouldNotShowWithdrawableTypes(types: Array<SelectedWithdrawableType>) {
    types.forEach(type => {
      cy.get(`input[value="${type}"]`).should('not.exist')
    })
  }

  shouldShowWithdrawables(withdrawables: Array<Withdrawable>) {
    withdrawables.forEach(withdrawable => {
      cy.get(`input[value="${withdrawable.id}"]`).should('exist')
    })
  }

  shouldNotShowWithdrawables(withdrawables: Array<Withdrawable>) {
    withdrawables.forEach(type => {
      cy.get(`input[value="${type.id}"]`).should('not.exist')
    })
  }

  selectType(type: 'placementRequest' | 'placement' | 'application') {
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
