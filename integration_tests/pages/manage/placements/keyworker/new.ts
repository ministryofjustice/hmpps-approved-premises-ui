import type { Cas1CurrentKeyWorker, Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import paths from '../../../../../server/paths/manage'
import { UnauthorisedPage } from '../../../unauthorised'

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
    cy.visit(
      paths.premises.placements.keyworker.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
      {
        failOnStatusCode: false,
      },
    )
    return new UnauthorisedPage()
  }

  completeForm(keyworkerName: string): void {
    this.checkCheckboxByLabel(keyworkerName)
  }

  shouldShowKeyworkersRadios(currentKeyworkers: Array<Cas1CurrentKeyWorker>) {
    currentKeyworkers.forEach((currentKeyworker: Cas1CurrentKeyWorker) => {
      this.verifyRadioByLabel(currentKeyworker.summary.name)
    })
    this.verifyRadioByLabel('Assign a different keyworker')
  }
}
