import {
  ApprovedPremisesApplication,
  Cas1PremisesBasicSummary,
  PlacementRequestDetail,
} from '../../../../server/@types/shared'
import { placementDates } from '../../../../server/utils/match'
import Page from '../../page'

export default class CreatePlacementPage extends Page {
  constructor(private readonly placementRequest: PlacementRequestDetail) {
    super(
      (placementRequest.application as ApprovedPremisesApplication).isWomensApplication
        ? `Record a women’s Approved Premises placement`
        : 'Record an Approved Premises (AP) placement',
    )
  }

  dateInputsShouldBePrepopulated(): void {
    const dates = placementDates(this.placementRequest.expectedArrival, String(this.placementRequest.duration))

    this.dateInputsShouldContainDate('arrivalDate', dates.startDate)
    this.dateInputsShouldContainDate('departureDate', dates.endDate)
  }

  completeForm(startDate: string, endDate: string, premises: Cas1PremisesBasicSummary): void {
    this.clearDateInputs('arrivalDate')
    this.completeDateInputs('arrivalDate', startDate)

    this.clearDateInputs('departureDate')
    this.completeDateInputs('departureDate', endDate)
    if (!(this.placementRequest.application as ApprovedPremisesApplication).isWomensApplication) {
      this.getSelectInputByIdAndSelectAnEntry('area0', premises.apArea.name)
      this.getSelectInputByIdAndSelectAnEntry('premisesId', premises.id)
    } else {
      this.checkRadioByNameAndValue('premisesId', premises.id)
    }
  }

  premisesShouldNotBeAvailable(premises: Cas1PremisesBasicSummary): void {
    cy.get(`#area0 option:contains(${premises.apArea.name})`).should('not.exist')
  }
}
