import type { Cas1SpaceBooking, StaffMember } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import apiPaths from '../../../../server/paths/api'

export class KeyworkerAssignmentPage extends Page {
  constructor(title: string = 'Edit keyworker') {
    super(title)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): KeyworkerAssignmentPage {
    cy.visit(paths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new KeyworkerAssignmentPage(`Authorisation Error`)
  }

  completeForm(value: string): void {
    this.checkRadioByNameAndValue('keyworker', value)
  }
}

// TODO: Remove deprecated page class when new flow released (APS-2644)
export class DeprecatedKeyworkerAssignmentPage extends Page {
  constructor(
    private readonly placement: Cas1SpaceBooking,
    private readonly staffMembers: Array<StaffMember>,
    title: string = 'Edit keyworker details',
  ) {
    super(title)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): DeprecatedKeyworkerAssignmentPage {
    cy.visit(
      paths.premises.placements.keyworkerDeprecated({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
      {
        failOnStatusCode: false,
      },
    )
    return new DeprecatedKeyworkerAssignmentPage(null, null, `Authorisation Error`)
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

  checkApiCalled(placement: Cas1SpaceBooking): void {
    cy.task(
      'verifyApiPost',
      apiPaths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }),
    ).then(body => {
      expect(body).to.deep.equal({ staffCode: this.staffMembers[1].code })
    })
  }
}
