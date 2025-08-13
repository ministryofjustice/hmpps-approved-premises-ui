import { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../../../page'
import paths from '../../../../../server/paths/manage'

export class FindAKeyworkerPage extends Page {
  constructor(readonly placement: Cas1SpaceBooking) {
    super('Find a keyworker')

    this.checkForBackButton(
      paths.premises.placements.keyworker.new({
        premisesId: placement.premises.id,
        placementId: placement.id,
      }),
    )
  }

  completeForm(searchQuery: string) {
    this.completeTextInput('nameOrEmail', searchQuery)
  }
}
