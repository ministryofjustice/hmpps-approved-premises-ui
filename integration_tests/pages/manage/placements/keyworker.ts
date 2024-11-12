import type { Cas1SpaceBooking, StaffMember } from '@approved-premises/api'
import Page from '../../page'

export class KeyworkerAssignmentPage extends Page {
  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly staffMembers: Array<StaffMember>,
  ) {
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

  completeForm(): void {
    this.getSelectInputByIdAndSelectAnEntry('staffCode', this.staffMembers[1].name)
  }
}
