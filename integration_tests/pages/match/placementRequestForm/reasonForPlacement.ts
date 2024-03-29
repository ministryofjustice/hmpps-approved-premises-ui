import type { PlacementType } from '@approved-premises/api'
import paths from '../../../../server/paths/placementApplications'

import Page from '../../page'

export default class ReasonForPlacementPage extends Page {
  constructor() {
    super('Reason for placement')
  }

  static visit(placementRequestId: string): ReasonForPlacementPage {
    cy.visit(
      paths.placementApplications.pages.show({
        id: placementRequestId,
        task: 'request-a-placement',
        page: 'reason-for-placement',
      }),
    )
    return new ReasonForPlacementPage()
  }

  completeForm(reason: PlacementType) {
    this.checkRadioByNameAndValue('reason', reason)
  }
}
