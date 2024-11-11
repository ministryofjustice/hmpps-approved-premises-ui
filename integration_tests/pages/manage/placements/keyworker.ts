import type { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../page'
// import { DateFormats } from '../../../../server/utils/dateUtils'

export class KeyworkerAssignmentPage extends Page {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Edit keyworker details')
  }

  shouldShowKeyworkerList(placement: Cas1SpaceBooking): void {
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Keyworker' },
        value: { text: placement.keyWorkerAllocation?.keyWorker?.name },
      },
    ])
  }

  shouldShowError(): void {
    cy.get('.govuk-error-summary__list').should('contain', 'You must select a keyworker')
  }

  completeForm(keyworkerName: string): void {
    this.getSelectInputByIdAndSelectAnEntry('keyworkerId', keyworkerName)
  }
}
