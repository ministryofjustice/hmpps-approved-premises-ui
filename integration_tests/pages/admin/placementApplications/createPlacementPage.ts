import { ApprovedPremisesSummary, PlacementRequestDetail } from '../../../../server/@types/shared'
import { placementDates } from '../../../../server/utils/matchUtils'
import Page from '../../page'

export default class CreatePlacementPage extends Page {
  constructor(private readonly placementRequest: PlacementRequestDetail) {
    super('Record an Approved Premises (AP) placement')
  }

  dateInputsShouldBePrepopulated(): void {
    const dates = placementDates(this.placementRequest.expectedArrival, String(this.placementRequest.duration))

    this.dateInputsShouldContainDate('arrivalDate', dates.startDate)
    this.dateInputsShouldContainDate('departureDate', dates.endDate)
  }

  completeForm(startDate: string, endDate: string, premises: ApprovedPremisesSummary): void {
    this.clearDateInputs('arrivalDate')
    this.completeDateInputs('arrivalDate', startDate)

    this.clearDateInputs('departureDate')
    this.completeDateInputs('departureDate', endDate)
    this.getSelectInputByIdAndSelectAnEntry('area0', premises.apArea)
    this.getSelectInputByIdAndSelectAnEntry('premisesId', premises.id)
  }
}
