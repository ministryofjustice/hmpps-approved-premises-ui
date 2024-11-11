import type { Cas1SpaceBooking, StaffMember } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'

export class KeyworkerAssignmentPage extends Page {
  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly staffMembers: Array<StaffMember>,
    title: string = 'Edit keyworker details',
  ) {
    super(title)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): KeyworkerAssignmentPage {
    cy.visit(paths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new KeyworkerAssignmentPage(null, null, `Authorisation Error`)
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
