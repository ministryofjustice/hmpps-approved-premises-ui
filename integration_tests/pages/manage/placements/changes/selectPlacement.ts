import { Cas1SpaceBookingSummary } from '@approved-premises/api'
import Page from '../../../page'
import { placementName } from '../../../../../server/utils/placementRequests/placementSummaryList'

export class SelectPlacementPage extends Page {
  constructor() {
    super('Which placement do you want to change?')
  }

  shouldShowPlacementsAsRadios(placements: Array<Cas1SpaceBookingSummary>) {
    placements.forEach(placement => {
      this.verifyRadioByLabel(placementName(placement))
    })
  }
}
