import { Cas1SpaceBooking } from '@approved-premises/api'
import OccupancyFilterPage from '../../../shared/occupancyFilterPage'
import { placementOverviewSummary } from '../../../../../server/utils/placements'

export class ChangePlacementPage extends OccupancyFilterPage {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super('Change placement')
  }

  shouldShowPlacementOverview() {
    this.shouldContainSummaryListItems(placementOverviewSummary(this.placement).rows)
  }

  completeForm(arrivalDate: string, departureDate: string) {
    this.clearDateInputs('arrivalDate')
    this.completeDateInputs('arrivalDate', arrivalDate)
    this.clearDateInputs('departureDate')
    this.completeDateInputs('departureDate', departureDate)
  }
}
