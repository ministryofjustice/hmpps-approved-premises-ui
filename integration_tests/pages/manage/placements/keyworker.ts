import type { Cas1CurrentKeyWorker, Cas1SpaceBooking, StaffMember } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import apiPaths from '../../../../server/paths/api'
import { UnauthorisedPage } from '../../unauthorised'

export class KeyworkerAssignmentPage extends Page {
  constructor(readonly placement: Cas1SpaceBooking) {
    super('Assign or change someone’s keyworker')

    this.checkForBackButton(
      paths.premises.placements.show({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
    )
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): UnauthorisedPage {
    cy.visit(paths.premises.placements.keyworker({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new UnauthorisedPage()
  }

  completeForm(keyworkerName: string): void {
    this.checkCheckboxByLabel(keyworkerName)
  }

  shouldShowKeyworkersRadios(currentKeyworkers: Array<Cas1CurrentKeyWorker>) {
    currentKeyworkers.forEach((currentKeyworker: Cas1CurrentKeyWorker) => {
      this.verifyRadioByLabel(currentKeyworker.summary.name, currentKeyworker.summary.id)
    })
    this.verifyRadioByLabel('Assign a different keyworker', 'new')
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
