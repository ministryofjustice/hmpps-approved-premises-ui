import { Withdrawable } from '../../../server/@types/shared'
import matchPaths from '../../../server/paths/match'
import { SelectedWithdrawableType } from '../../../server/utils/applications/withdrawables'
import Page, { parseHtml } from '../page'

export default class SelectWithdrawableTypePage extends Page {
  constructor(heading: string) {
    super(heading)
  }

  shouldShowWithdrawableGuidance(withdrawableType: 'placement' | 'request') {
    cy.get('.govuk-inset-text').then(insetTextElement => {
      const { actual, expected } = parseHtml(
        insetTextElement,
        `Withdraw one ${withdrawableType} at a time. Contact the CRU if you do not see the placement you wish to withdraw.`,
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

  shouldShowNoWithdrawablesGuidance() {
    cy.get('.govuk-warning-text__text').then(warningText => {
      const { actual, expected } = parseHtml(
        warningText,
        'Warning You are not able to withdraw the application or any associated requests for placement or placements. If you need to make a withdrawal relating to this application, contact the CRU.',
      )

      expect(actual).to.equal(expected)
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
      cy.get(`[data-cy-withdrawable-id="${id}"]`).should(
        'have.attr',
        'href',
        matchPaths.placementRequests.show({ placementRequestId: id }),
      )
    }
  }
}
